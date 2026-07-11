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
  const batches: any[] = [];
  const batchMap = new Map<string, number>();
  for (const t of thumbnails) {
    const idx = batchMap.get(t.batchId);
    const serialized = { ...t, createdAt: t.createdAt.toISOString() };
    if (idx === undefined) {
      batchMap.set(t.batchId, batches.length);
      batches.push({ batchId: t.batchId, createdAt: serialized.createdAt, thumbnails: [serialized] });
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
        <h1 className="font-display text-3xl font-bold tracking-tight">Stop guessing. Start knowing.</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Upload 2-3 thumbnails. Our AI scores each on composition, emotion, text legibility, and predicted CTR — then picks the winner with reasoning you can act on.</p>
      </div>
      <ThumbnailTester initialBatches={batches} />
    </div>
  );
}
