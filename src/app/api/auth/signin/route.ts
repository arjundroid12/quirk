import { NextResponse } from "next/server";
import { z } from "zod";
import { queryOne, execute, generateId, now } from "@/lib/db";
import { signInAndSetCookie } from "@/lib/auth-edge";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SignInSchema = z.object({
  email: z.string().email().max(120),
  name: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SignInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const { email, name } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const displayName = name?.trim() || normalizedEmail.split("@")[0];

    let user: { id: string; email: string; name: string | null };

    try {
      // Try to find existing user
      const existing = await queryOne<{ id: string; email: string; name: string | null }>(
        "SELECT id, email, name FROM User WHERE email = ?",
        [normalizedEmail]
      );

      if (existing) {
        // Update name
        await execute("UPDATE User SET name = ?, updatedAt = ? WHERE id = ?", [
          displayName, now(), existing.id,
        ]);
        user = { id: existing.id, email: existing.email, name: displayName };
      } else {
        // Create new user
        const id = generateId();
        await execute(
          "INSERT INTO User (id, email, name, emailVerified, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [id, normalizedEmail, displayName, now(), "user", now(), now()]
        );
        user = { id, email: normalizedEmail, name: displayName };
      }
    } catch (dbErr) {
      console.warn("[auth/signin] DB error:", dbErr);
      const transientId = crypto.randomUUID();
      user = { id: `transient_${transientId}`, email: normalizedEmail, name: displayName };
    }

    await signInAndSetCookie(user);
    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error("[auth/signin] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
