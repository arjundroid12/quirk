import { getSession } from "@/lib/session";
import { scoreScript } from "@/lib/zai";
import { z } from "zod";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const ScoreSchema = z.object({
  content: z.string().min(10).max(16000),
  platform: z.string().min(2).max(40),
  niche: z.string().min(2).max(80),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = ScoreSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, error: "Invalid input" }, { status: 400 });
    const score = await scoreScript(parsed.data);
    return Response.json({ ok: true, score });
  } catch (err: any) {
    console.error("[score POST] error", err);
    return Response.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
