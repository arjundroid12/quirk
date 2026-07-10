import { getSession } from "@/lib/auth-edge";
import { query } from "@/lib/db";
import { ThumbnailTester } from "@/components/thumbnail-tester/thumbnail-tester";

export const runtime = "edge";

export default async function ThumbnailsPage() {
  const session = await getSession();
  const thumbnails = await query("SELECT * FROM Thumbnail WHERE userId = ? ORDER BY createdAt DESC LIMIT 100", [session?.user?.id || ""]);

  const batches: any[] = [];
  const batchMap = new Map<string, number>();
  for (const t of thumbnails) {
    const idx = batchMap.get((t as any).batchId);
    const serialized = { ...(t as any), createdAt: new Date((t as any).createdAt).toISOString() };
    if (idx === undefined) {
      batchMap.set((t as any).batchId, batches.length);
      batches.push({ batchId: (t as any).batchId, createdAt: serialized.createdAt, thumbnails: [serialized] });
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
