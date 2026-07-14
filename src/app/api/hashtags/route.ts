import { getSession } from "@/lib/session";
import { generateHashtags } from "@/lib/zai";
import { z } from "zod";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const HashtagSchema = z.object({
  topic: z.string().min(2).max(200),
  niche: z.string().min(2).max(80),
  platform: z.string().min(2).max(40),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = HashtagSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, error: "Invalid input" }, { status: 400 });
    const hashtags = await generateHashtags(parsed.data);
    return Response.json({ ok: true, hashtags });
  } catch (err: any) {
    console.error("[hashtags POST] error", err);
    return Response.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
