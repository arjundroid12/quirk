import { NextResponse } from "next/server";
import { z } from "zod";
import { queryOne, execute, now } from "@/lib/db";
import { getSession } from "@/lib/auth-edge";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const UpdateIdeaSchema = z.object({
  status: z.enum(["idea", "filmed", "published", "killed"]).optional(),
  notes: z.string().max(2000).optional().nullable(),
  title: z.string().max(200).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await queryOne<any>("SELECT * FROM Idea WHERE id = ?", [id]);
    if (!existing || existing.authorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = UpdateIdeaSchema.safeParse(body);
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
    await execute(`UPDATE Idea SET ${updates.join(", ")} WHERE id = ?`, args);
    const updated = await queryOne("SELECT * FROM Idea WHERE id = ?", [id]);
    return NextResponse.json({ ok: true, idea: updated });
  } catch (err: any) {
    console.error("[idea PATCH] error", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await queryOne<any>("SELECT * FROM Idea WHERE id = ?", [id]);
    if (!existing || existing.authorId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    await execute("DELETE FROM Idea WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
