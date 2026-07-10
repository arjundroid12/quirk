import { NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { getSession } from "@/lib/auth-edge";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await queryOne<any>("SELECT * FROM Thumbnail WHERE id = ?", [id]);
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    await execute("DELETE FROM Thumbnail WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
