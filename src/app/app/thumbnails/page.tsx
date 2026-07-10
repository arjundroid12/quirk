import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ThumbnailTester } from "@/components/thumbnail-tester/thumbnail-tester";

export default async function ThumbnailsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const thumbnails = await db.thumbnail.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Group by batchId (server-side, pass to client)
  const batches: Array<{
    batchId: string;
    createdAt: string;
    thumbnails: Array<{
      id: string;
      imageData: string;
      fileName: string | null;
      score: number;
      compositionScore: number;
      emotionScore: number;
      textLegibilityScore: number;
      ctrPrediction: number;
      reasoning: string;
      isWinner: boolean;
      createdAt: string;
    }>;
  }> = [];

  const batchMap = new Map<string, number>();
  for (const t of thumbnails) {
    const idx = batchMap.get(t.batchId);
    const serialized = {
      id: t.id,
      imageData: t.imageData,
      fileName: t.fileName,
      score: t.score,
      compositionScore: t.compositionScore,
      emotionScore: t.emotionScore,
      textLegibilityScore: t.textLegibilityScore,
      ctrPrediction: t.ctrPrediction,
      reasoning: t.reasoning,
      isWinner: t.isWinner,
      createdAt: t.createdAt.toISOString(),
    };
    if (idx === undefined) {
      batchMap.set(t.batchId, batches.length);
      batches.push({
        batchId: t.batchId,
        createdAt: t.createdAt.toISOString(),
        thumbnails: [serialized],
      });
    } else {
      batches[idx].thumbnails.push(serialized);
    }
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
          Thumbnail Tester
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Stop guessing. Start knowing.
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Upload 2-3 thumbnails. Our AI scores each on composition, emotion, text legibility, and predicted CTR — then picks the winner with reasoning you can act on.
        </p>
      </div>

      <ThumbnailTester initialBatches={batches} />
    </div>
  );
}
