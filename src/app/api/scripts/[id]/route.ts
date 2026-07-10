import { NextResponse } from "next/server";
import { z } from "zod";
import { queryOne, execute, now } from "@/lib/db";
import { getSession } from "@/lib/auth-edge";

export const runtime = "edge";
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
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const script = await queryOne("SELECT * FROM Script WHERE id = ?", [id]);
    if (!script || script.authorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, script });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await queryOne<any>("SELECT * FROM Script WHERE id = ?", [id]);
    if (!existing || existing.authorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = UpdateScriptSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

    const updates: string[] = [];
    const args: any[] = [];
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) {
        updates.push(`${k} = ?`);
        args.push(v);
      }
    }
    updates.push("updatedAt = ?");
    args.push(now());
    args.push(id);
    await execute(`UPDATE Script SET ${updates.join(", ")} WHERE id = ?`, args);

    const updated = await queryOne("SELECT * FROM Script WHERE id = ?", [id]);
    return NextResponse.json({ ok: true, script: updated });
  } catch (err: any) {
    console.error("[scripts PATCH] error", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await queryOne<any>("SELECT * FROM Script WHERE id = ?", [id]);
    if (!existing || existing.authorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    await execute("DELETE FROM Script WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
