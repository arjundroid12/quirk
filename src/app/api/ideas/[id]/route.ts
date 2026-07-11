import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { z } from "zod";

const UpdateIdeaSchema = z.object({
  status: z.enum(["idea", "filmed", "published", "killed"]).optional(),
  notes: z.string().max(2000).optional().nullable(),
  title: z.string().max(200).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;
    const { id } = await params;
    const existing = await db.idea.findUnique({ where: { id } });
    if (!existing || existing.authorId !== userId) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const body = await req.json();
    const parsed = UpdateIdeaSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const idea = await db.idea.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ ok: true, idea });
  } catch (err: any) {
    console.error("[idea PATCH] error", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;
    const { id } = await params;
    const existing = await db.idea.findUnique({ where: { id } });
    if (!existing || existing.authorId !== userId) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    await db.idea.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
