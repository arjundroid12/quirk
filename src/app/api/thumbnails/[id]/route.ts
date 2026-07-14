import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieStr = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const origin = process.env.NEXTAUTH_URL || "https://quirk-ten.vercel.app";
  try {
    const res = await fetch(`${origin}/api/auth/session`, {
      headers: { cookie: cookieStr },
      cache: "no-store",
    });
    const data = await res.json();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

function toArg(val: any) {
  if (val === null || val === undefined) return { type: "null" };
  if (typeof val === "number") return { type: "float", value: val };
  if (typeof val === "boolean") return { type: "integer", value: val ? 1 : 0 };
  return { type: "text", value: String(val) };
}

async function tursoFetch(sql: string, args: any[] = []) {
  const url = process.env.DATABASE_URL!.replace("libsql://", "https://") + "/v2/pipeline";
  const token = process.env.LIBSQL_TOKEN;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql, args: args.map(toArg) } }] }),
  });
  const data = await res.json();
  const result = data.results?.[0]?.response?.result;
  if (!result?.rows || !result.cols) return [];
  return result.rows.map((raw: any[]) => {
    const row: any = {};
    result.cols.forEach((col: any, i: number) => { row[col.name] = raw[i]?.value ?? null; });
    return row;
  });
}

async function tursoExecute(sql: string, args: any[] = []) {
  const url = process.env.DATABASE_URL!.replace("libsql://", "https://") + "/v2/pipeline";
  const token = process.env.LIBSQL_TOKEN;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql, args: args.map(toArg) } }] }),
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await tursoFetch("SELECT * FROM Thumbnail WHERE id = ?", [id]);
    if (!existing.length || existing[0].userId !== userId) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    await tursoExecute("DELETE FROM Thumbnail WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
