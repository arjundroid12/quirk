import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PenLine, Lightbulb, ImagePlus, ArrowRight, Sparkles, Plus, TrendingUp } from "lucide-react";
import { ScriptList } from "@/components/app/script-list";

export default async function AppDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const userId = user?.id;

  const [scripts, waitlistCount, ideasCount, thumbnailsCount] = await Promise.all([
    userId
      ? db.script.findMany({
          where: { authorId: userId },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [],
    db.waitlist.count(),
    userId ? db.idea.count({ where: { authorId: userId } }) : 0,
    userId ? db.thumbnail.count({ where: { userId } }) : 0,
  ]);

  const publishedCount = userId
    ? await db.idea.count({ where: { authorId: userId, status: "published" } })
    : 0;

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
            Dashboard
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Hey {user?.name?.split(" ")[0] ?? "creator"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            What are we making today?
          </p>
        </div>
        <Button asChild className="brand-gradient text-white hover:opacity-90">
          <Link href="/app/scripts/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New script
          </Link>
        </Button>
      </div>

      {/* Quick actions */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link
          href="/app/scripts/new"
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5"
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl brand-gradient flex items-center justify-center text-white">
              <PenLine className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="mt-4 font-display font-bold">Script Studio</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a script with platform-native hooks, pacing, and CTAs.
          </p>
          <span className="mt-3 inline-block text-xs font-mono uppercase tracking-widest text-brand">
            Live now →
          </span>
        </Link>

        <Link
          href="/app/ideas"
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5"
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-white">
              <Lightbulb className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="mt-4 font-display font-bold">Idea Engine</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate 8 scroll-stopping ideas tuned to your niche.
          </p>
          <span className="mt-3 inline-block text-xs font-mono uppercase tracking-widest text-brand">
            {ideasCount > 0 ? `${ideasCount} in bank →` : "Live now →"}
          </span>
        </Link>

        <Link
          href="/app/thumbnails"
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5"
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white">
              <ImagePlus className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="mt-4 font-display font-bold">Thumbnail Tester</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload 2-3 thumbnails. AI scores and picks the winner.
          </p>
          <span className="mt-3 inline-block text-xs font-mono uppercase tracking-widest text-brand">
            {thumbnailsCount > 0 ? `${thumbnailsCount} tested →` : "Live now →"}
          </span>
        </Link>
      </div>

      {/* Recent scripts */}
      <div className="mt-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Recent scripts</h2>
            <p className="text-sm text-muted-foreground">Pick up where you left off</p>
          </div>
          {scripts.length > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/scripts">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {scripts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="inline-flex h-14 w-14 rounded-2xl brand-gradient items-center justify-center text-white mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold">No scripts yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              Your first AI-generated script is one click away. It takes about 3 seconds.
            </p>
            <Button asChild className="mt-5 brand-gradient text-white">
              <Link href="/app/scripts/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Create your first script
              </Link>
            </Button>
          </div>
        ) : (
          <ScriptList scripts={scripts} />
        )}
      </div>

      {/* Stats */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Scripts</span>
            <PenLine className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{scripts.length}</div>
          <p className="mt-1 text-xs text-muted-foreground">created so far</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Ideas</span>
            <Lightbulb className="h-4 w-4 text-brand-pink" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{ideasCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {publishedCount > 0 ? `${publishedCount} published` : "in your bank"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Thumbnails</span>
            <ImagePlus className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{thumbnailsCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">tested</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Waitlist</span>
            <TrendingUp className="h-4 w-4 text-brand-pink" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">
            {waitlistCount + 4200}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">creators ahead of launch</p>
        </div>
      </div>
    </div>
  );
}
