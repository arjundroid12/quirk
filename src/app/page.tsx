import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  PenLine,
  Lightbulb,
  ImagePlus,
  ChevronRight,
  Github,
  Twitter,
  Instagram,
  Youtube,
  CheckCircle2,
} from "lucide-react";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";

const features = [
  {
    icon: PenLine,
    name: "Script Studio",
    tag: "Writes with you",
    desc: "AI scripts for Reels, Shorts, TikTok, and long-form. Hook templates, platform-native pacing, CTAs that don't feel salesy. Edit inline with one click.",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Lightbulb,
    name: "Idea Engine",
    tag: "Kills blank-page syndrome",
    desc: "Daily content ideas tuned to your niche and the platform you post on. Save them to your bank, mark as filmed, published, or killed.",
    color: "from-fuchsia-500 to-rose-500",
  },
  {
    icon: ImagePlus,
    name: "Thumbnail Tester",
    tag: "Stop guessing, start knowing",
    desc: "Upload 2-3 thumbnails. AI scores them on composition, emotion, text legibility, and predicted CTR — then picks the winner with reasoning.",
    color: "from-rose-500 to-orange-500",
  },
];

const pains = [
  { pain: "I have no idea what to post", today: "Scroll TikTok for 2 hours", with: "AI trend analyzer + personalized ideas" },
  { pain: "Writing scripts takes forever", today: "Stare at a blank doc", with: "Script generator with hook templates + pacing" },
  { pain: "Which thumbnail works?", today: "Upload 3, wait a week, guess", with: "AI thumbnail A/B tester with CTR prediction" },
  { pain: "What should I make next?", today: "Gut feeling", with: "Content calendar AI (30-day plan)" },
];

const outcomes = [
  "Save 5-8 hours every week on planning, scripting, and analysis",
  "Higher view counts — better hooks + thumbnails compound",
  "Kill decision fatigue — your next 30 days mapped for you",
  "Studio-grade insights without paying an editor or strategist",
];

const testimonials = [
  {
    quote:
      "I stopped opening ChatGPT, Canva, and Notion in three different tabs. QUIRK just gets the creator workflow.",
    name: "Maya R.",
    title: "UGC creator, 240k Reels",
  },
  {
    quote:
      "The Script Studio hook generator is scary good. My average view duration jumped 14% on the first three scripts I rewrote.",
    name: "Dev S.",
    title: "YouTuber, 80k subs",
  },
  {
    quote:
      "Finally a tool built by people who actually post. You can tell the person who made this knows what 2am editing feels like.",
    name: "Aisha K.",
    title: "TikTok creator, 1.1M",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Hero />

        {/* Pains → Solutions */}
        <section className="relative py-24 sm:py-32 border-y border-border/60">
          <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
                The creator pain
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Every creator hits the same walls.{" "}
                <span className="brand-gradient-text">We broke them.</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                You don't have a content problem. You have a workflow problem. Five tools, three tabs, two hours of context-switching — and you haven't filmed a single frame yet.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {pains.map((p, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
                >
                  <p className="font-display text-lg font-semibold">"{p.pain}"</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs font-mono uppercase tracking-widest text-muted-foreground/70 w-20 shrink-0">Today</span>
                      <span className="text-muted-foreground line-through/0">{p.today}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs font-mono uppercase tracking-widest text-brand w-20 shrink-0">QUIRK</span>
                      <span className="text-foreground font-medium">{p.with}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
                Three tools. One workspace.
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
                The AI-native creator workspace
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Each tool replaces a separate app you currently pay for. Together, they replace the chaos.
              </p>
            </div>

            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={f.name}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <h3 className="font-display text-xl font-bold">{f.name}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-full">
                      {f.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                    Coming in v1 {i === 0 && "(live now)"}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity group-hover:opacity-20 ${f.color}" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="py-24 sm:py-32 bg-brand-dark text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-brand blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-brand-pink blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-pink">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
                  Why creators will switch
                </span>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
                  Less grind. More great work.
                </h2>
                <p className="mt-4 text-white/70 text-lg">
                  The #1 reason creators quit isn't lack of talent — it's burnout from the constant grind of ideation, optimization, and platform-juggling. QUIRK takes the grind off your plate.
                </p>
              </div>

              <ul className="space-y-4">
                {outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-brand-pink shrink-0 mt-0.5" />
                    <span className="text-white/90 text-lg">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
                Built by creators. Loved by creators.
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
                What creators are saying
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <figure
                  key={i}
                  className="relative rounded-3xl border border-border bg-card p-8"
                >
                  <div className="text-brand text-5xl font-display leading-none mb-4">"</div>
                  <blockquote className="text-foreground leading-relaxed">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.title}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist CTA */}
        <section className="py-24 sm:py-32 relative overflow-hidden">
          <div className="mx-auto max-w-4xl px-6">
            <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-card p-8 sm:p-14 glow-brand">
              <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
              <div className="relative text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  Early access is open
                </div>
                <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight">
                  Stop juggling 5 tools.<br />
                  <span className="brand-gradient-text">Start creating.</span>
                </h2>
                <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                  Get early access, founder updates, and a free month of Pro when we launch. No spam — just creator-first product news.
                </p>
                <div className="mt-8 max-w-md mx-auto">
                  <WaitlistForm />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Joining the waitlist unlocks the Script Studio today — no waiting required.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-brand-dark text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo light size={32} />
              <p className="mt-4 text-white/60 text-sm max-w-sm">
                The AI-native workspace for creators who'd rather create than juggle 5 tools. Find your quirk. Ship it.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="https://github.com/arjundroid12" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white/90">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/app/scripts" className="hover:text-white transition">Script Studio</Link></li>
                <li><Link href="/signin" className="hover:text-white transition">Sign in</Link></li>
                <li><Link href="/#waitlist" className="hover:text-white transition">Waitlist</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white/90">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li><Link href="https://arjunv.is-a.dev" className="hover:text-white transition">About founder</Link></li>
                <li><a href="mailto:arjunvashishtha2004@gmail.com" className="hover:text-white transition">Contact</a></li>
                <li><span className="text-white/40">Made in Bhopal, India</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© 2026 QUIRK. All rights reserved.</p>
            <p className="font-mono">v0.2.0 — QUIRK build</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
