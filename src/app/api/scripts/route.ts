import { NextResponse } from "next/server";
import { z } from "zod";
import { query, execute, generateId, now } from "@/lib/db";
import { getSession } from "@/lib/auth-edge";
import { generateScript, type ScriptGenInput } from "@/lib/zai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CreateScriptSchema = z.object({
  niche: z.string().min(2).max(80),
  platform: z.enum(["reels", "shorts", "tiktok", "longform", "carousel"]),
  tone: z.enum(["casual", "hype", "educational", "storytelling", "authoritative"]),
  topic: z.string().max(200).optional().nullable(),
  durationSec: z.number().int().min(5).max(1800).optional().nullable(),
  cta: z.string().max(200).optional().nullable(),
  generate: z.boolean().default(true),
  title: z.string().max(200).optional().nullable(),
  content: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = CreateScriptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    const input = parsed.data;

    let title = input.title ?? "";
    let content = input.content ?? "";
    let hook = "";
    let cta = input.cta ?? "";
    let hashtags: string[] = [];

    if (input.generate) {
      const genInput: ScriptGenInput = {
        niche: input.niche,
        platform: input.platform,
        tone: input.tone,
        topic: input.topic ?? undefined,
        durationSec: input.durationSec ?? undefined,
        cta: input.cta ?? undefined,
      };
      const gen = await generateScript(genInput);
      title = gen.title;
      hook = gen.hook;
      cta = gen.cta;
      hashtags = gen.hashtags;
      content = [
        `# ${gen.title}`,
        "",
        `**Hook:** ${gen.hook}`,
        "",
        gen.body,
        "",
        `**CTA:** ${gen.cta}`,
        "",
        `**Hashtags:** ${gen.hashtags.map((h) => "#" + h).join(" ")}`,
        "",
        `> Estimated duration: ${gen.estimatedDuration}`,
        `> ${gen.notes}`,
      ].join("\n");
    }

    const id = generateId();
    await execute(
      `INSERT INTO Script (id, title, content, platform, tone, niche, cta, tags, authorId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title || "Untitled script", content, input.platform, input.tone, input.niche, cta || null, hashtags.join(","), userId, now(), now()]
    );

    return NextResponse.json({ ok: true, script: { id, title, content, platform: input.platform, tone: input.tone, niche: input.niche, cta: cta || null, tags: hashtags.join(","), authorId: userId, createdAt: now(), updatedAt: now() } });
  } catch (err: any) {
    console.error("[scripts POST] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const scripts = await query(
      "SELECT * FROM Script WHERE authorId = ? ORDER BY createdAt DESC LIMIT 100",
      [session.user.id]
    );
    return NextResponse.json({ ok: true, scripts });
  } catch (err: any) {
    console.error("[scripts GET] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
