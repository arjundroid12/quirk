"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenLine, Lightbulb, ImagePlus, ArrowRight, Sparkles, Plus, Loader2, Wrench, Calendar } from "lucide-react";

interface ScriptData {
  id: string;
  title: string;
  content: string;
  platform: string;
  niche: string;
  status?: string;
  createdAt: string;
}

const platformLabel: Record<string, string> = {
  reels: "Reels", shorts: "Shorts", tiktok: "TikTok", longform: "Long-form", carousel: "Carousel",
};

const statusColors: Record<string, string> = {
  draft: "rgba(100,116,139,0.1)", filming: "rgba(245,158,11,0.1)",
  filmed: "rgba(59,130,246,0.1)", published: "rgba(16,185,129,0.1)",
};
const statusText: Record<string, string> = {
  draft: "#64748b", filming: "#f59e0b", filmed: "#3b82f6", published: "#10b981",
};

export default function AppDashboard() {
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [ideasCount, setIdeasCount] = useState(0);
  const [thumbnailsCount, setThumbnailsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("creator");

  useEffect(() => {
    (async () => {
      try {
        const [scriptsRes, ideasRes, thumbsRes, sessionRes] = await Promise.all([
          fetch("/api/scripts", { cache: "no-store" }),
          fetch("/api/ideas", { cache: "no-store" }),
          fetch("/api/thumbnails", { cache: "no-store" }),
          fetch("/api/auth/session", { cache: "no-store" }),
        ]);

        const scriptsData = await scriptsRes.json();
        if (scriptsData.ok) setScripts(scriptsData.scripts);

        const ideasData = await ideasRes.json();
        if (ideasData.ok) setIdeasCount(ideasData.ideas.length);

        const thumbsData = await thumbsRes.json();
        if (thumbsData.ok) setThumbnailsCount(thumbsData.batches.length);

        const sessionData = await sessionRes.json();
        if (sessionData.user?.name) setUserName(sessionData.user.name.split(" ")[0]);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" /> Dashboard
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Hey {userName} 👋</h1>
          <p className="mt-1 text-muted-foreground">What are we making today?</p>
        </div>
        <Button asChild className="brand-gradient text-white hover:opacity-90">
          <Link href="/app/scripts/new"><Plus className="mr-1.5 h-4 w-4" />New script</Link>
        </Button>
      </div>

      {/* Decorative illustration banner */}
      <div className="mt-6 relative rounded-3xl overflow-hidden border border-border/60 h-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art-vision.avif" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand/60 via-brand-pink/40 to-transparent" />
        <div className="relative h-full flex items-center px-8">
          <p className="text-white font-display text-lg font-bold drop-shadow-lg">8 AI tools. One workspace. Create freely.</p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/app/scripts/new" className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5">
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl brand-gradient flex items-center justify-center text-white"><PenLine className="h-5 w-5" /></div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="mt-4 font-display font-bold">Script Studio</h3>
          <p className="mt-1 text-sm text-muted-foreground">Generate scripts with hooks, pacing, and CTAs.</p>
          <span className="mt-3 inline-block text-xs font-mono uppercase tracking-widest text-brand">
            {scripts.length > 0 ? `${scripts.length} scripts →` : "Live now →"}
          </span>
        </Link>
        <Link href="/app/ideas" className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5">
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-white"><Lightbulb className="h-5 w-5" /></div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="mt-4 font-display font-bold">Idea Engine</h3>
          <p className="mt-1 text-sm text-muted-foreground">8 scroll-stopping ideas tuned to your niche.</p>
          <span className="mt-3 inline-block text-xs font-mono uppercase tracking-widest text-brand">
            {ideasCount > 0 ? `${ideasCount} in bank →` : "Live now →"}
          </span>
        </Link>
        <Link href="/app/thumbnails" className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5">
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white"><ImagePlus className="h-5 w-5" /></div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="mt-4 font-display font-bold">Thumbnail Tester</h3>
          <p className="mt-1 text-sm text-muted-foreground">Upload 2-3 thumbnails. AI picks the winner.</p>
          <span className="mt-3 inline-block text-xs font-mono uppercase tracking-widest text-brand">
            {thumbnailsCount > 0 ? `${thumbnailsCount} tested →` : "Live now →"}
          </span>
        </Link>
        <Link href="/app/tools" className="group relative overflow-hidden rounded-2xl border border-brand/30 bg-brand/5 p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/10">
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white"><Wrench className="h-5 w-5" /></div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="mt-4 font-display font-bold">AI Tools <span className="text-xs text-brand">NEW</span></h3>
          <p className="mt-1 text-sm text-muted-foreground">Script Scorer, Repurposer, Hashtags, Hooks.</p>
          <span className="mt-3 inline-block text-xs font-mono uppercase tracking-widest text-brand">4 tools →</span>
        </Link>
      </div>

      {/* Calendar link */}
      <div className="mt-4">
        <Link href="/app/calendar" className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-brand/40 transition-all">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold">Content Calendar</h3>
            <p className="text-sm text-muted-foreground">Visual month view — track scripts from draft to published</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
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
          <p className="mt-1 text-xs text-muted-foreground">in your bank</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Thumbnails</span>
            <ImagePlus className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{thumbnailsCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">tested</p>
        </div>
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
              <Link href="/app/scripts">View all<ArrowRight className="ml-1 h-4 w-4" /></Link>
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
              Your first AI-generated script is one click away. Includes hook, body, CTA, and hashtags.
            </p>
            <Button asChild className="mt-5 brand-gradient text-white">
              <Link href="/app/scripts/new"><Plus className="mr-1.5 h-4 w-4" />Create your first script</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {scripts.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                href={`/app/scripts/${s.id}`}
                className="block rounded-2xl border border-border bg-card p-5 hover:border-brand/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg group-hover:text-brand transition-colors">
                      {s.title || "Untitled"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {s.content.replace(/[#*>\-]/g, "").slice(0, 120)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-brand/10 text-brand font-medium">
                        {platformLabel[s.platform] ?? s.platform}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {s.niche}
                      </span>
                      {s.status && s.status !== "draft" && (
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: statusColors[s.status], color: statusText[s.status] }}
                        >
                          {s.status}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
