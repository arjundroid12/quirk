import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { generateScript, humanizeScript, type ScriptGenInput } from "@/lib/zai";
import { z } from "zod";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const CreateScriptSchema = z.object({
  niche: z.string().min(2).max(80),
  platform: z.enum(["reels", "shorts", "tiktok", "longform", "carousel"]),
  tone: z.enum(["casual", "hype", "educational", "storytelling", "authoritative"]),
  topic: z.string().max(200).optional().nullable(),
  durationSec: z.number().int().min(5).max(1800).optional().nullable(),
  cta: z.string().max(200).optional().nullable(),
  generate: z.boolean().default(true),
  humanize: z.boolean().default(false),
  title: z.string().max(200).optional().nullable(),
  content: z.string().optional().nullable(),
});

// Use getSession (getServerSession) — same as /api/auth/session endpoint
async function getAuthUserId(): Promise<string | null> {
  try {
    const session = await getSession();
    return (session?.user as any)?.id || null;
  } catch {
    return null;
  }
}

function toArg(val: any) {
  if (val === null || val === undefined) return { type: "null" };
  if (typeof val === "number") return { type: "float", value: val };
  if (typeof val === "boolean") return { type: "integer", value: val ? 1 : 0 };
  if (val instanceof Date) return { type: "text", value: val.toISOString() };
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

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
function now() { return new Date().toISOString(); }

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = CreateScriptSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;

    let title = input.title ?? "";
    let content = input.content ?? "";
    let cta = input.cta ?? "";
    let hashtags: string[] = [];

    if (input.generate) {
      const genInput: ScriptGenInput = {
        niche: input.niche, platform: input.platform, tone: input.tone,
        topic: input.topic ?? undefined, durationSec: input.durationSec ?? undefined, cta: input.cta ?? undefined,
      };
      const gen = await generateScript(genInput);
      title = gen.title;
      cta = gen.cta;
      hashtags = gen.hashtags;
      content = [
        `# ${gen.title}`, "", `**Hook:** ${gen.hook}`, "", gen.body, "",
        `**CTA:** ${gen.cta}`, "", `**Hashtags:** ${gen.hashtags.map((h) => "#" + h).join(" ")}`,
        "", `> Estimated duration: ${gen.estimatedDuration}`, `> ${gen.notes}`,
      ].join("\n");

      // Optional humanizer pass — rewrites content to evade AI detection
      if (input.humanize) {
        content = await humanizeScript(content, input.niche, input.platform, input.tone);
      }
    }

    const id = genId();
    await tursoExecute(
      "INSERT INTO Script (id, title, content, platform, tone, niche, cta, tags, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, title || "Untitled script", content, input.platform, input.tone, input.niche, cta || null, hashtags.join(","), userId, now(), now()]
    );
    return Response.json({ ok: true, script: { id, title, content, platform: input.platform, tone: input.tone, niche: input.niche, cta, tags: hashtags.join(","), authorId: userId, createdAt: now(), updatedAt: now() } });
  } catch (err: any) {
    console.error("[scripts POST] error", err);
    return Response.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const scripts = await tursoFetch("SELECT * FROM Script WHERE authorId = ? ORDER BY createdAt DESC LIMIT 100", [userId]);
    return Response.json({ ok: true, scripts });
  } catch (err: any) {
    console.error("[scripts GET] error", err);
    return Response.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
