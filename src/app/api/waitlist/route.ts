import { NextResponse } from "next/server";
import { z } from "zod";
import { queryOne, execute, generateId, now } from "@/lib/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const WaitlistSchema = z.object({
  email: z.string().email().max(120),
  name: z.string().max(80).optional().nullable(),
  niche: z.string().max(80).optional().nullable(),
  source: z.string().max(40).optional().default("landing"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = WaitlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    const { email, name, niche, source } = parsed.data;

    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM Waitlist WHERE email = ?",
      [email.toLowerCase()]
    );

    let id: string;
    if (existing) {
      await execute(
        "UPDATE Waitlist SET name = ?, niche = ? WHERE id = ?",
        [name ?? null, niche ?? null, existing.id]
      );
      id = existing.id;
    } else {
      id = generateId();
      await execute(
        "INSERT INTO Waitlist (id, email, name, niche, source, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        [id, email.toLowerCase(), name ?? null, niche ?? null, source, now()]
      );
    }
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error("[waitlist] error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await query<{ count: number }>("SELECT COUNT(*) as count FROM Waitlist");
    return NextResponse.json({ count: rows[0]?.count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
