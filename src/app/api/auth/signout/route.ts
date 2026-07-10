import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth-edge";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
