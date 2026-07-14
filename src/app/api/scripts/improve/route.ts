import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { improveScriptSection, type ScriptGenInput } from "@/lib/zai";
import { z } from "zod";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const ImproveSchema = z.object({
  section: z.enum(["hook", "body", "cta"]),
  current: z.string().min(1).max(8000),
  niche: z.string().min(1).max(80),
  platform: z.enum(["reels", "shorts", "tiktok", "longform", "carousel"]),
  tone: z.enum(["casual", "hype", "educational", "storytelling", "authoritative"]),
  instruction: z.string().max(500).optional(),
});

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieStr = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const origin = process.env.NEXTAUTH_URL || "https://quirk-ten.vercel.app";
  try {
    const res = await fetch(`${origin}/api/auth/session`, {
      headers: { cookie: cookieStr },
      cache: "no-store",
    });
    const data = await res.json();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
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
