import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { headers, cookies } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const UpdateScriptSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  platform: z.enum(["reels", "shorts", "tiktok", "longform", "carousel"]).optional(),
  tone: z.enum(["casual", "hype", "educational", "storytelling", "authoritative"]).optional(),
  niche: z.string().max(80).optional(),
  cta: z.string().max(200).optional().nullable(),
  tags: z.string().optional().nullable(),
});

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieStr = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const token = await getToken({
    req: { headers: { cookie: cookieStr } } as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return (token?.id as string) || null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const script = await db.script.findUnique({ where: { id } });
    if (!script || script.authorId !== userId) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, script });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await db.script.findUnique({ where: { id } });
    if (!existing || existing.authorId !== userId) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const body = await req.json();
    const parsed = UpdateScriptSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const script = await db.script.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ ok: true, script });
  } catch (err: any) {
    console.error("[scripts PATCH] error", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await db.script.findUnique({ where: { id } });
    if (!existing || existing.authorId !== userId) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    await db.script.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
