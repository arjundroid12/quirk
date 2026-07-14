import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size={32} />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1 grid lg:grid-cols-2">
        {/* Left: 404 content */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="text-center max-w-md">
            <div className="relative inline-block">
              <div className="font-display text-[120px] sm:text-[180px] font-bold leading-none brand-gradient-text" aria-hidden="true">
                404
              </div>
              <div className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-mono uppercase tracking-widest text-brand">
                <Sparkles className="h-3.5 w-3.5" /> Quirky
              </div>
            </div>
            <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold tracking-tight">
              This page wandered off.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Let's get you back to creating. The page doesn't exist — but your next great script, idea, or thumbnail is one click away.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="brand-gradient text-white hover:opacity-90">
                <Link href="/"><Home className="mr-1.5 h-4 w-4" />Back to home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/app"><ArrowLeft className="mr-1.5 h-4 w-4" />Open the app</Link>
              </Button>
            </div>
            <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground">
              <p>Error code: <span className="font-mono">404 — Not Found</span></p>
            </div>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="hidden lg:flex items-center justify-center bg-brand/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative max-w-md p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art-vision.avif" alt="Abstract vision art" className="w-full h-auto rounded-2xl shadow-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
