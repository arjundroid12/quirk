import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImagePlus, ArrowLeft, Bell } from "lucide-react";

export default function ThumbnailsPage() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/app" className="hover:text-foreground">
          Dashboard
        </Link>
      </div>

      <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
        Thumbnail Tester
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        AI thumbnail scoring — coming soon
      </h1>
      <p className="mt-2 text-muted-foreground">
        Upload 2-3 thumbnails and our AI scores them on composition, emotion, text legibility, and predicted CTR — then picks the winner with reasoning you can act on.
      </p>

      <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 items-center justify-center text-white mb-4">
          <ImagePlus className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-bold">In Session 2</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          We're shipping Thumbnail Tester in the next build. Upload thumbnails, get a winner in seconds.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-brand">
          <Bell className="h-3.5 w-3.5" />
          You'll be notified in-app
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/app/scripts/new">
            <ArrowLeft className="mr-1.5 h-4 w-4 rotate-180" />
            Try Script Studio meanwhile
          </Link>
        </Button>
      </div>
    </div>
  );
}
