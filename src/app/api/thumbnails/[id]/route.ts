import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;
    const { id } = await params;
    const existing = await db.thumbnail.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    await db.thumbnail.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
