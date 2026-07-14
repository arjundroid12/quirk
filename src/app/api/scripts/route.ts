import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { generateScript, type ScriptGenInput } from "@/lib/zai";
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
  title: z.string().max(200).optional().nullable(),
  content: z.string().optional().nullable(),
});

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieStr = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const token = await getToken({
    req: { headers: { cookie: cookieStr } } as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return (token?.id as string) || null;
}

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
    }

    const script = await db.script.create({
      data: {
        title: title || "Untitled script", content,
        platform: input.platform, tone: input.tone, niche: input.niche,
        cta: cta || null, tags: hashtags.join(","), authorId: userId,
      },
    });
    return Response.json({ ok: true, script });
  } catch (err: any) {
    console.error("[scripts POST] error", err);
    return Response.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const scripts = await db.script.findMany({ where: { authorId: userId }, orderBy: { createdAt: "desc" }, take: 100 });
    return Response.json({ ok: true, scripts });
  } catch (err: any) {
    console.error("[scripts GET] error", err);
    return Response.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
