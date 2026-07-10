import { NextResponse } from "next/server";
import { z } from "zod";
import { query, execute, generateId, now } from "@/lib/db";
import { getSession } from "@/lib/auth-edge";
import { generateIdeas, type IdeaTone } from "@/lib/zai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const GenerateSchema = z.object({
  niche: z.string().min(2).max(80),
  platform: z.enum(["reels", "shorts", "tiktok", "longform", "carousel"]),
  tone: z.enum(["educational", "entertaining", "inspirational", "controversial"]).optional(),
  count: z.number().int().min(3).max(12).default(8),
  generate: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = GenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    const input = parsed.data;

    const ideas = await generateIdeas({
      niche: input.niche,
      platform: input.platform,
      tone: input.tone as IdeaTone | undefined,
      count: input.count,
    });

    const created = [];
    for (const idea of ideas) {
      const id = generateId();
      await execute(
        `INSERT INTO Idea (id, title, hookPreview, angle, format, niche, platform, tone, status, authorId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, idea.title, idea.hookPreview, idea.angle, idea.format, input.niche, input.platform, input.tone || "educational", "idea", userId, now(), now()]
      );
      created.push({
        id, title: idea.title, hookPreview: idea.hookPreview, angle: idea.angle, format: idea.format,
        niche: input.niche, platform: input.platform, tone: input.tone || "educational", status: "idea",
        notes: null, authorId: userId, createdAt: now(), updatedAt: now(),
      });
    }

    return NextResponse.json({ ok: true, ideas: created });
  } catch (err: any) {
    console.error("[ideas POST] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    let sql = "SELECT * FROM Idea WHERE authorId = ?";
    const args: any[] = [session.user.id];
    if (status && ["idea", "filmed", "published", "killed"].includes(status)) {
      sql += " AND status = ?";
      args.push(status);
    }
    sql += " ORDER BY createdAt DESC LIMIT 200";
    const ideas = await query(sql, args);
    return NextResponse.json({ ok: true, ideas });
  } catch (err: any) {
    console.error("[ideas GET] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
