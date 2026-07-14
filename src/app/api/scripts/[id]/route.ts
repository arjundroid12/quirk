import { NextResponse } from "next/server";
import { db, queryOne } from "@/lib/db";
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
    console.error("[scripts GET /id] id:", id);

    // Direct Turso fetch — bypass all db.ts abstractions
    const url = process.env.DATABASE_URL?.replace("libsql://", "https://") + "/v2/pipeline";
    const token = process.env.LIBSQL_TOKEN;
    console.error("[scripts GET /id] url:", url?.slice(0, 50), "hasToken:", !!token);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "SELECT * FROM Script WHERE id = ?", args: [{ type: "text", value: id }] } }] }),
    });

    console.error("[scripts GET /id] Turso status:", res.status);
    const data = await res.json();
    console.error("[scripts GET /id] Turso type:", data.results?.[0]?.type);

    const rows = data.results?.[0]?.response?.result?.rows || [];
    const cols = data.results?.[0]?.response?.result?.cols || [];

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    // Parse row manually
    const script: any = {};
    cols.forEach((col: any, i: number) => {
      const cell = rows[0][i];
      script[col.name] = cell?.value ?? null;
    });

    return NextResponse.json({ ok: true, script });
  } catch (err: any) {
    console.error("[scripts GET /id] ERROR:", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
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
