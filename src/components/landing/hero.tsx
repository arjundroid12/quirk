"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { LogoMark } from "@/components/logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[480px] w-[480px] rounded-full bg-brand/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-brand-pink/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-brand"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-native creator toolkit
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
            >
              Stop juggling 5 tools.<br />
              <span className="brand-gradient-text">Start creating.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl"
            >
              QUIRK is the AI workspace that helps creators plan, script, optimize, and grow — all in one place. Built by creators, for creators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <Button asChild size="lg" className="brand-gradient text-white hover:opacity-90 group">
                <Link href="/signin?next=/app">
                  Try Script Studio free
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">
                  <Play className="mr-1.5 h-4 w-4" />
                  See how it works
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex items-center gap-4 text-sm text-muted-foreground"
            >
              <div className="flex -space-x-2">
                {["A", "M", "D", "K"].map((c, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full ring-2 ring-background brand-gradient flex items-center justify-center text-white text-xs font-bold"
                  >
                    {c}
                  </div>
                ))}
              </div>
              <span>
                <span className="font-semibold text-foreground">4,200+</span> creators on the waitlist
              </span>
            </motion.div>
          </div>

          {/* Right: product mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-border bg-card p-3 shadow-2xl shadow-brand/10 glow-brand">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 px-3 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                <div className="ml-3 flex-1 h-6 rounded-md bg-muted/60 flex items-center px-3 text-[10px] font-mono text-muted-foreground">
                  quirk.app/app/scripts
                </div>
              </div>

              {/* Mock app body */}
              <div className="rounded-xl bg-background overflow-hidden">
                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-44 shrink-0 bg-sidebar p-3 text-sidebar-foreground">
                    <div className="flex items-center gap-2 mb-4">
                      <LogoMark size={20} />
                      <span className="text-xs font-bold">QUIRK</span>
                    </div>
                    {["Scripts", "Ideas", "Thumbnails", "Calendar", "Settings"].map((s, i) => (
                      <div
                        key={s}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs mb-0.5 ${
                          i === 0 ? "bg-sidebar-accent text-white" : "text-sidebar-foreground/60"
                        }`}
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                        {s}
                      </div>
                    ))}
                  </div>

                  {/* Editor */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-3 w-32 bg-foreground/10 rounded" />
                        <div className="mt-1 h-2 w-20 bg-foreground/5 rounded" />
                      </div>
                      <div className="h-6 w-16 brand-gradient rounded-md" />
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex gap-1.5">
                        <div className="h-5 px-2 rounded-full bg-brand/10 text-brand text-[10px] font-mono flex items-center">Reels</div>
                        <div className="h-5 px-2 rounded-full bg-brand-pink/10 text-brand-pink text-[10px] font-mono flex items-center">Hype</div>
                        <div className="h-5 px-2 rounded-full bg-muted text-muted-foreground text-[10px] font-mono flex items-center">UGC</div>
                      </div>

                      <div className="rounded-lg border border-brand/20 bg-brand/5 p-3">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-brand mb-1">Hook</div>
                        <div className="text-xs font-medium">
                          Stop scrolling if you've ever felt burnt out as a creator —
                          this changes everything.
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {[100, 92, 96, 88, 78].map((w, i) => (
                          <div
                            key={i}
                            className="h-2 bg-foreground/10 rounded"
                            style={{ width: `${w}%` }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <div className="h-5 px-2 rounded bg-foreground/5 text-[10px] font-mono flex items-center text-muted-foreground">
                          ✨ Improve hook
                        </div>
                        <div className="h-5 px-2 rounded bg-foreground/5 text-[10px] font-mono flex items-center text-muted-foreground">
                          Save
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -top-4 -left-4 rounded-2xl border border-border bg-card p-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg brand-gradient flex items-center justify-center text-white text-sm">
                  ✨
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Generated</div>
                  <div className="text-xs font-bold">in 2.4s</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="absolute -bottom-4 -right-4 rounded-2xl border border-border bg-card p-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 text-sm">
                  ↑
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Retention</div>
                  <div className="text-xs font-bold text-green-600">+14% on hook</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
