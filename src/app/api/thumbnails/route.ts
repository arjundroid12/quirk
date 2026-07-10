import { NextResponse } from "next/server";
import { z } from "zod";
import { query, execute, generateId, now } from "@/lib/db";
import { getSession } from "@/lib/auth-edge";
import { analyzeThumbnail } from "@/lib/zai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const AnalyzeSchema = z.object({
  images: z
    .array(z.object({
      dataUrl: z.string().min(1).max(MAX_IMAGE_SIZE * 1.4),
      fileName: z.string().max(200).optional(),
    }))
    .min(2, "Upload at least 2 images")
    .max(MAX_IMAGES, `Max ${MAX_IMAGES} images`),
  niche: z.string().max(80).optional(),
  platform: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = AnalyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const input = parsed.data;

    for (const img of input.images) {
      if (!img.dataUrl.startsWith("data:image/")) {
        return NextResponse.json({ ok: false, error: "All images must be data:image/* URLs" }, { status: 400 });
      }
    }

    const analyses = await Promise.all(
      input.images.map((img) =>
        analyzeThumbnail({
          imageDataUrl: img.dataUrl,
          niche: input.niche,
          platform: input.platform,
        })
      )
    );

    let winnerIdx = 0;
    let highScore = -1;
    analyses.forEach((a, i) => {
      if (a.overall > highScore) { highScore = a.overall; winnerIdx = i; }
    });

    const batchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const created = [];

    for (let i = 0; i < input.images.length; i++) {
      const img = input.images[i];
      const a = analyses[i];
      const id = generateId();
      await execute(
        `INSERT INTO Thumbnail (id, userId, imageData, fileName, score, compositionScore, emotionScore, textLegibilityScore, ctrPrediction, reasoning, isWinner, batchId, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, img.dataUrl, img.fileName ?? null, a.overall, a.composition, a.emotion, a.textLegibility, a.ctr, a.reasoning, i === winnerIdx ? 1 : 0, batchId, now()]
      );
      created.push({
        id, userId, imageData: img.dataUrl, fileName: img.fileName ?? null,
        score: a.overall, compositionScore: a.composition, emotionScore: a.emotion,
        textLegibilityScore: a.textLegibility, ctrPrediction: a.ctr, reasoning: a.reasoning,
        isWinner: i === winnerIdx, batchId, createdAt: now(),
      });
    }

    return NextResponse.json({ ok: true, thumbnails: created, winnerId: created[winnerIdx].id, batchId });
  } catch (err: any) {
    console.error("[thumbnails POST] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const thumbnails = await query(
      "SELECT * FROM Thumbnail WHERE userId = ? ORDER BY createdAt DESC LIMIT 100",
      [session.user.id]
    );
    const batches: any[] = [];
    const batchMap = new Map<string, number>();
    for (const t of thumbnails) {
      const idx = batchMap.get(t.batchId);
      if (idx === undefined) {
        batchMap.set(t.batchId, batches.length);
        batches.push({ batchId: t.batchId, createdAt: t.createdAt, thumbnails: [t] });
      } else {
        batches[idx].thumbnails.push(t);
      }
    }
    return NextResponse.json({ ok: true, batches });
  } catch (err: any) {
    console.error("[thumbnails GET] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
