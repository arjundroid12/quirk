"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, PenLine, ChevronLeft, Loader2 } from "lucide-react";

interface ScriptData {
  id: string;
  title: string;
  content: string;
  platform: string;
  tone: string;
  niche: string;
  cta: string | null;
  tags: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

const platformLabel: Record<string, string> = {
  reels: "Reels", shorts: "Shorts", tiktok: "TikTok", longform: "Long-form", carousel: "Carousel",
};

const statusColors: Record<string, string> = {
  draft: "rgba(100,116,139,0.1)",
  filming: "rgba(245,158,11,0.1)",
  filmed: "rgba(59,130,246,0.1)",
  published: "rgba(16,185,129,0.1)",
};

const statusText: Record<string, string> = {
  draft: "#64748b", filming: "#f59e0b", filmed: "#3b82f6", published: "#10b981",
};

export default function ScriptsListPage() {
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/scripts", { cache: "no-store" });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (data.ok) setScripts(data.scripts);
        else setError(data.error || "Failed to load");
      } catch (err: any) {
        setError(err?.message || "Network error");
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/app" className="hover:text-foreground">Dashboard</Link>
        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
        <span>Scripts</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Script Studio</h1>
          <p className="mt-1 text-muted-foreground">All your AI-generated scripts in one place.</p>
        </div>
        <Button asChild className="brand-gradient text-white hover:opacity-90">
          <Link href="/app/scripts/new"><Plus className="mr-1.5 h-4 w-4" />New script</Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : scripts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl brand-gradient items-center justify-center text-white mb-4">
            <PenLine className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold">No scripts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Generate your first script — AI writes the hook, body, CTA, and hashtags.
          </p>
          <Button asChild className="mt-5 brand-gradient text-white">
            <Link href="/app/scripts/new"><Plus className="mr-1.5 h-4 w-4" />Create your first script</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map((s) => (
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
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {s.content.replace(/[#*>\-]/g, "").slice(0, 150)}
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
                        style={{ background: statusColors[s.status] || statusColors.draft, color: statusText[s.status] || statusText.draft }}
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
  );
}
