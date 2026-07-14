import { getSession } from "@/lib/session";
import { repurposeContent } from "@/lib/zai";
import { z } from "zod";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const RepurposeSchema = z.object({
  content: z.string().min(50).max(16000),
  niche: z.string().min(2).max(80),
  targetPlatform: z.enum(["reels", "shorts", "tiktok"]),
  clipCount: z.number().int().min(2).max(6).default(3),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = RepurposeSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, error: "Invalid input" }, { status: 400 });
    const clips = await repurposeContent(parsed.data);
    return Response.json({ ok: true, clips });
  } catch (err: any) {
    console.error("[repurpose POST] error", err);
    return Response.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
