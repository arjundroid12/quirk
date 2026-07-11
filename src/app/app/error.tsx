"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[QUIRK app error]", error);
  }, [error]);

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

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-amber-500/10 items-center justify-center text-amber-600 mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Something went wrong.
          </h1>
          <p className="mt-3 text-muted-foreground">
            We hit an unexpected error while loading this page. Try again — if it keeps happening, sign out and back in.
          </p>

          {error?.message && (
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-3 text-left">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                Error
              </div>
              <code className="text-xs text-destructive font-mono break-all">
                {error.message}
              </code>
              {error.digest && (
                <div className="mt-2 text-[10px] font-mono text-muted-foreground">
                  Digest: {error.digest}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="brand-gradient text-white hover:opacity-90">
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/app">
                <Home className="mr-1.5 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
