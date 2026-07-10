"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowRight, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "reels" | "shorts" | "tiktok" | "longform" | "carousel";
type Tone = "casual" | "hype" | "educational" | "storytelling" | "authoritative";

const platforms: { id: Platform; label: string; hint: string }[] = [
  { id: "reels", label: "Reels", hint: "IG · 15-90s" },
  { id: "shorts", label: "Shorts", hint: "YT · 15-60s" },
  { id: "tiktok", label: "TikTok", hint: "TT · 15-180s" },
  { id: "longform", label: "Long-form", hint: "YT · 5-12min" },
  { id: "carousel", label: "Carousel", hint: "IG · 5-8 slides" },
];

const tones: { id: Tone; label: string; desc: string }[] = [
  { id: "casual", label: "Casual", desc: "Like texting a friend" },
  { id: "hype", label: "Hype", desc: "Urgent, punchy, energetic" },
  { id: "educational", label: "Educational", desc: "Clear, structured, value-first" },
  { id: "storytelling", label: "Storytelling", desc: "Scene-setting, narrative" },
  { id: "authoritative", label: "Authoritative", desc: "Expert, evidence-backed" },
];

const niches = [
  "Fitness UGC",
  "Tech reviews",
  "Food & cooking",
  "Beauty & skincare",
  "Productivity",
  "Finance & money",
  "Travel",
  "Gaming",
  "Fashion",
  "Education",
  "Comedy / POV",
  "Business / marketing",
];

export function NewScriptForm() {
  const router = useRouter();
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<Platform>("reels");
  const [tone, setTone] = useState<Tone>("hype");
  const [topic, setTopic] = useState("");
  const [durationSec, setDurationSec] = useState("");
  const [cta, setCta] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) {
      toast.error("Tell us your niche first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          platform,
          tone,
          topic: topic.trim() || null,
          durationSec: durationSec ? Number(durationSec) : null,
          cta: cta.trim() || null,
          generate: true,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to generate");
      toast.success("Script generated 🎉");
      router.push(`/app/scripts/${data.script.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to generate script");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Niche */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Your niche</Label>
        <p className="text-sm text-muted-foreground">What do you create content about?</p>
        <div className="flex flex-wrap gap-2">
          {niches.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNiche(n)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition",
                niche === n
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-card text-muted-foreground hover:border-brand/40"
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <Input
          placeholder="Or type your own niche..."
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Platform */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Platform</Label>
        <p className="text-sm text-muted-foreground">Where will this content live?</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={cn(
                "p-3 rounded-xl border text-left transition",
                platform === p.id
                  ? "border-brand bg-brand/5 shadow-md shadow-brand/5"
                  : "border-border bg-card hover:border-brand/40"
              )}
            >
              <div className="font-semibold text-sm">{p.label}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                {p.hint}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Tone</Label>
        <p className="text-sm text-muted-foreground">How should it feel?</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {tones.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              className={cn(
                "p-3 rounded-xl border text-left transition",
                tone === t.id
                  ? "border-brand bg-brand/5 shadow-md shadow-brand/5"
                  : "border-border bg-card hover:border-brand/40"
              )}
            >
              <div className="font-semibold text-sm">{t.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Optional context */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wand2 className="h-4 w-4" />
          Optional — leave blank and we'll pick for you
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            placeholder="e.g. 3 mistakes beginner runners make"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="duration">Target duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              min={5}
              max={1800}
              placeholder="e.g. 45"
              value={durationSec}
              onChange={(e) => setDurationSec(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta">CTA (optional)</Label>
            <Input
              id="cta"
              placeholder="e.g. follow for more running tips"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading || !niche.trim()}
          size="lg"
          className="brand-gradient text-white hover:opacity-90 flex-1 sm:flex-initial"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating script...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate script
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Powered by Z.AI GLM-4.6. Scripts are saved to your account automatically.
      </p>
    </form>
  );
}
