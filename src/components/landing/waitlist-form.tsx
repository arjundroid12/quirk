"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || null, niche: niche || null }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setStatus("done");
      toast.success("You're on the list 🎉 Check your inbox for the Script Studio link.");
    } catch (err: any) {
      setStatus("idle");
      toast.error(err?.message ?? "Something went wrong");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
        <p className="mt-3 font-semibold">You're in.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll email <span className="font-mono text-foreground">{email}</span> with founder updates and a free Pro month at launch.
        </p>
        <Button asChild className="mt-4 brand-gradient text-white" size="sm">
          <a href="/signin?next=/app">
            Try Script Studio now
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-left">
      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background"
        />
        <Input
          type="text"
          placeholder="Your niche (e.g. fitness UGC)"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="bg-background"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background flex-1"
          required
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="brand-gradient text-white hover:opacity-90"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <Sparkles className="mr-1.5 h-4 w-4" />
              Join waitlist
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
