import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

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
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    const { email, name, niche, source } = parsed.data;
    const entry = await db.waitlist.upsert({
      where: { email: email.toLowerCase() },
      update: { ...(name ? { name } : {}), ...(niche ? { niche } : {}) },
      create: { email: email.toLowerCase(), name: name ?? null, niche: niche ?? null, source },
    });
    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err: any) {
    console.error("[waitlist] error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const count = await db.waitlist.count();
  return NextResponse.json({ count });
}
