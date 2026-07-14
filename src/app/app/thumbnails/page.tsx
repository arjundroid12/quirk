import { ThumbnailTester } from "@/components/thumbnail-tester/thumbnail-tester";

export const dynamic = "force-dynamic";

export default function ThumbnailsPage() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
          Thumbnail Tester
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Which thumbnail wins?</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Upload 2-3 thumbnails. AI scores them on composition, emotion, text legibility, and CTR.
          We'll pick the winner and tell you why.
        </p>
      </div>
      <ThumbnailTester initialBatches={[]} />
    </div>
  );
}
