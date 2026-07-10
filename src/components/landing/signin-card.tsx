"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2, AlertCircle, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function SignInCard({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMsg("Please enter a valid email");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
        }),
      });
      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error ?? "Failed to sign in");
      }

      // Success — redirect to next
      window.location.href = next || "/app";
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message ?? "Failed to sign in");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-xl shadow-brand/5"
    >
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand/15 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-mono uppercase tracking-widest text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          Sign in to QUIRK
        </div>

        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">
          Welcome, creator.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enter your email to sign in. In dev mode you'll go straight in — no email check required.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <p className="mt-2 font-semibold">Check your inbox.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent a magic link to <span className="font-mono text-foreground">{email}</span>. Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Arjun V."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full brand-gradient text-white hover:opacity-90"
              size="lg"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing you in...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Sign in & start creating
                </>
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-xs text-muted-foreground text-center">
          By signing in, you agree to our terms and privacy policy. No password, no spam.
        </p>
      </div>
    </motion.div>
  );
}
