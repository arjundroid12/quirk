import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { PenLine, Wand2, Lightbulb, ImagePlus, TrendingUp, Scissors, Hash, Zap, ArrowRight, Sparkles } from "lucide-react";

const allFeatures = [
  { icon: PenLine, name: "Script Studio", tag: "Writes with you", desc: "AI scripts for Reels, Shorts, TikTok, and long-form. Platform-native pacing, CTAs, hashtags. Edit inline with one click.", color: "from-violet-500 to-fuchsia-500", status: "Live", date: "Day 1" },
  { icon: Wand2, name: "Humanizer", tag: "Bypasses AI detection", desc: "Rewrites scripts to evade Sapling, CopyLeaks, Quillbot, and Scribbr. Short sentences, natural rhythm, zero AI vocabulary.", color: "from-purple-500 to-violet-500", status: "Live", date: "Day 1" },
  { icon: Lightbulb, name: "Idea Engine", tag: "Kills blank-page syndrome", desc: "8 scroll-stopping content ideas per batch. Save to your bank, mark as filmed, published, or killed.", color: "from-fuchsia-500 to-rose-500", status: "Live", date: "Day 1" },
  { icon: ImagePlus, name: "Thumbnail Tester", tag: "Stop guessing", desc: "Upload 2-3 thumbnails. AI scores composition, emotion, text legibility, and CTR. Picks the winner with reasoning.", color: "from-rose-500 to-orange-500", status: "Live", date: "Day 1" },
  { icon: TrendingUp, name: "Script Scorer", tag: "Rate before you film", desc: "AI rates your script on hook strength, pacing, CTA, and retention. Get a score + specific improvements.", color: "from-emerald-500 to-teal-500", status: "New", date: "Latest" },
  { icon: Scissors, name: "Content Repurposer", tag: "1 → many", desc: "Paste long-form content. AI extracts 3-5 short-form clips with hooks, bodies, and CTAs — each ready to film.", color: "from-blue-500 to-cyan-500", status: "New", date: "Latest" },
  { icon: Hash, name: "Hashtag Generator", tag: "3-tier strategy", desc: "Get primary, secondary, and trending hashtags for any topic. AI explains the strategy. Copy all with one click.", color: "from-fuchsia-500 to-pink-500", status: "New", date: "Latest" },
  { icon: Zap, name: "Hook Generator", tag: "10 psychological triggers", desc: "Generate 3-10 hook variations using different psychological triggers — curiosity gap, bold claim, story setup, and more.", color: "from-amber-500 to-orange-500", status: "New", date: "Latest" },
];

export default function WhatsNewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={32} /></Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-brand mb-6">
              <Sparkles className="h-3.5 w-3.5" /> What's new in QUIRK
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
              8 AI tools for creators.{" "}
              <span className="brand-gradient-text">All live. All free.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              From script generation to AI-detection evasion, from hashtag research to content repurposing — QUIRK is the only workspace a creator needs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="brand-gradient text-white hover:opacity-90">
                <Link href="/app"><Sparkles className="mr-1.5 h-4 w-4" />Open the app</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to home <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {allFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.name} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
                    {f.status === "New" && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
                          <Sparkles className="h-3 w-3" /> NEW
                        </span>
                      </div>
                    )}
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-xs font-mono uppercase tracking-widest text-brand mb-2">{f.tag}</div>
                    <h3 className="font-display text-xl font-bold">{f.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      {f.status === "New" ? "Just shipped" : "Available since launch"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Illustration section */}
        <section className="py-24 border-t border-border/60">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-brand/5 rounded-3xl blur-3xl" />
                <div className="relative rounded-3xl overflow-hidden border border-border/60 shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/art-mental.avif" alt="Contemplative creator illustration" className="w-full h-auto" />
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" /> What's coming next
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">
                  We're just getting started.
                </h2>
                <ul className="mt-6 space-y-4">
                  {[
                    { title: "Content Calendar", desc: "Visual month view — see your scripts by status, plan your posting schedule, never miss a day." },
                    { title: "Trend Radar", desc: "Auto-suggest trending topics from web search, tailored to your niche and platform." },
                    { title: "Real email auth", desc: "Magic-link sign-in via email — no more dev bypass. Proper accounts, proper security." },
                    { title: "Usage tracking + Pro tier", desc: "Free tier gets 5 generations/day. Pro ($9/mo) gets unlimited + priority AI." },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-brand" />
                      </div>
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 brand-gradient text-white hover:opacity-90">
                  <Link href="/app">Try QUIRK now <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <Link href="/"><Logo size={28} /></Link>
          <p className="text-sm text-muted-foreground">QUIRK — AI creator toolkit. 8 tools, 1 workspace.</p>
        </div>
      </footer>
    </div>
  );
}
