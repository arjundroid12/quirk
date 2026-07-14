import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Method 1: Use db.script.findUnique
    const script = await db.script.findUnique({ where: { id } });

    // Method 2: Raw fetch (this works)
    const rawUrl = process.env.DATABASE_URL?.replace("libsql://", "https://");
    const rawToken = process.env.LIBSQL_TOKEN;
    const rawRes = await fetch(`${rawUrl}/v2/pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${rawToken}` },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "SELECT id, title FROM Script WHERE id = ?", args: [{ type: "text", value: id }] } }] }),
    });
    const rawData = await rawRes.json();
    const rawRows = rawData.results?.[0]?.response?.result?.rows?.length || 0;

    return NextResponse.json({
      ok: true,
      debug: {
        method1_findUnique: !!script,
        method2_rawRows: rawRows,
        dbUrl: process.env.DATABASE_URL?.slice(0, 50),
        hasToken: !!process.env.LIBSQL_TOKEN,
      },
      script: script || null,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message, stack: err?.stack?.split('\n').slice(0,3) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;
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
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;
    const { id } = await params;
    const existing = await db.script.findUnique({ where: { id } });
    if (!existing || existing.authorId !== userId) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    await db.script.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
