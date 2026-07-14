import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { generateIdeas, type IdeaTone } from "@/lib/zai";
import { z } from "zod";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const GenerateSchema = z.object({
  niche: z.string().min(2).max(80),
  platform: z.enum(["reels", "shorts", "tiktok", "longform", "carousel"]),
  tone: z.enum(["educational", "entertaining", "inspirational", "controversial"]).optional(),
  count: z.number().int().min(3).max(12).default(8),
  generate: z.boolean().default(true),
});

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieStr = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const token = await getToken({ req: { headers: { cookie: cookieStr } } as any, secret: process.env.NEXTAUTH_SECRET });
  return (token?.id as string) || null;
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

function toArg(val: any) {
  if (val === null || val === undefined) return { type: "null" };
  if (typeof val === "number") return { type: "float", value: val };
  if (typeof val === "boolean") return { type: "integer", value: val ? 1 : 0 };
  if (val instanceof Date) return { type: "text", value: val.toISOString() };
  return { type: "text", value: String(val) };
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
function now() { return new Date().toISOString(); }

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = GenerateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;

    const ideas = await generateIdeas({
      niche: input.niche, platform: input.platform,
      tone: input.tone as IdeaTone | undefined, count: input.count,
    });

    const created = [];
    for (const idea of ideas) {
      const id = genId();
      await tursoExecute(
        "INSERT INTO Idea (id, title, hookPreview, angle, format, niche, platform, tone, status, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, idea.title, idea.hookPreview, idea.angle, idea.format, input.niche, input.platform, input.tone ?? "educational", "idea", userId, now(), now()]
      );
      created.push({ id, ...idea, niche: input.niche, platform: input.platform, tone: input.tone ?? "educational", status: "idea", authorId: userId, createdAt: now(), updatedAt: now() });
    }
    return NextResponse.json({ ok: true, ideas: created });
  } catch (err: any) {
    console.error("[ideas POST] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    let sql = "SELECT * FROM Idea WHERE authorId = ?";
    const args: any[] = [userId];
    if (status && ["idea", "filmed", "published", "killed"].includes(status)) { sql += " AND status = ?"; args.push(status); }
    sql += " ORDER BY createdAt DESC LIMIT 200";
    const ideas = await tursoFetch(sql, args);
    return NextResponse.json({ ok: true, ideas });
  } catch (err: any) {
    console.error("[ideas GET] error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
