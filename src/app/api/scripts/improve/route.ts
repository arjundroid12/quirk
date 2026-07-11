import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { improveScriptSection, type ScriptGenInput } from "@/lib/zai";
import { z } from "zod";

const ImproveSchema = z.object({
  section: z.enum(["hook", "body", "cta"]),
  current: z.string().min(1).max(8000),
  niche: z.string().min(1).max(80),
  platform: z.enum(["reels", "shorts", "tiktok", "longform", "carousel"]),
  tone: z.enum(["casual", "hype", "educational", "storytelling", "authoritative"]),
  instruction: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = ImproveSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const { section, current, niche, platform, tone, instruction } = parsed.data;
    const improved = await improveScriptSection({
      section, current, niche,
      platform: platform as ScriptGenInput["platform"],
      tone: tone as ScriptGenInput["tone"],
      instruction,
    });
    return NextResponse.json({ ok: true, improved });
  } catch (err: any) {
    console.error("[scripts improve] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
