import { NextResponse } from "next/server";
export const maxDuration = 60;
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateIdeas, type IdeaTone } from "@/lib/zai";
import { z } from "zod";

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
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;
    if (!userId) return NextResponse.json({ ok: false, error: "No user id" }, { status: 401 });

    const body = await req.json();
    const parsed = GenerateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;

    const ideas = await generateIdeas({
      niche: input.niche, platform: input.platform,
      tone: input.tone as IdeaTone | undefined, count: input.count,
    });

    const created = await Promise.all(
      ideas.map((idea) =>
        db.idea.create({
          data: {
            title: idea.title, hookPreview: idea.hookPreview, angle: idea.angle, format: idea.format,
            niche: input.niche, platform: input.platform, tone: input.tone ?? "educational",
            status: "idea", authorId: userId,
          },
        })
      )
    );
    return NextResponse.json({ ok: true, ideas: created });
  } catch (err: any) {
    console.error("[ideas POST] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const where: any = { authorId: userId };
    if (status && ["idea", "filmed", "published", "killed"].includes(status)) where.status = status;
    const ideas = await db.idea.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ ok: true, ideas });
  } catch (err: any) {
    console.error("[ideas GET] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
