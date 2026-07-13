"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Lightbulb,
  Film,
  Send,
  X,
  ArrowRight,
  Wand2,
  Filter,
} from "lucide-react";

type Platform = "reels" | "shorts" | "tiktok" | "longform" | "carousel";
type Tone = "educational" | "entertaining" | "inspirational" | "controversial";
type IdeaStatus = "idea" | "filmed" | "published" | "killed";

interface Idea {
  id: string;
  title: string;
  hookPreview: string;
  angle: string;
  format: string;
  niche: string;
  platform: string;
  tone: string;
  status: IdeaStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const platforms: { id: Platform; label: string; hint: string }[] = [
  { id: "reels", label: "Reels", hint: "IG · 15-90s" },
  { id: "shorts", label: "Shorts", hint: "YT · 15-60s" },
  { id: "tiktok", label: "TikTok", hint: "TT · 15-180s" },
  { id: "longform", label: "Long-form", hint: "YT · 5-12min" },
  { id: "carousel", label: "Carousel", hint: "IG · 5-8 slides" },
];

const tones: { id: Tone; label: string; desc: string }[] = [
  { id: "educational", label: "Educational", desc: "Value-first, teaches something" },
  { id: "entertaining", label: "Entertaining", desc: "Humor-driven, shareable" },
  { id: "inspirational", label: "Inspirational", desc: "Aspirational, motivational" },
  { id: "controversial", label: "Controversial", desc: "Strong stance, debate-bait" },
];

const niches = [
  "Tech reviews",
  "Fitness UGC",
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

const statusConfig: Record<IdeaStatus, { label: string; color: string; icon: any }> = {
  idea: { label: "Idea", color: "bg-brand/10 text-brand border-brand/20", icon: Lightbulb },
  filmed: { label: "Filmed", color: "bg-amber-500/10 text-amber-700 border-amber-500/20", icon: Film },
  published: { label: "Published", color: "bg-green-500/10 text-green-700 border-green-500/20", icon: Send },
  killed: { label: "Killed", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: X },
};

const formatColors: Record<string, string> = {
  POV: "bg-violet-500/10 text-violet-700",
  listicle: "bg-blue-500/10 text-blue-700",
  tutorial: "bg-green-500/10 text-green-700",
  "story time": "bg-amber-500/10 text-amber-700",
  "myth bust": "bg-red-500/10 text-red-600",
  comparison: "bg-purple-500/10 text-purple-700",
  "behind the scenes": "bg-pink-500/10 text-pink-700",
  reaction: "bg-orange-500/10 text-orange-700",
  "hot take": "bg-rose-500/10 text-rose-700",
  "day in the life": "bg-teal-500/10 text-teal-700",
  "before/after": "bg-indigo-500/10 text-indigo-700",
};

export function IdeaEngine({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<Platform>("reels");
  const [tone, setTone] = useState<Tone | "">("");
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);

  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [bankFilter, setBankFilter] = useState<IdeaStatus | "all">("all");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Refresh from server on mount (in case stale). Empty deps = mount-only.
  useEffect(() => {
    refreshIdeas();
  }, []);

  async function refreshIdeas() {
    try {
      const res = await fetch("/api/ideas");
      const data = await res.json();
      if (data.ok) setIdeas(data.ideas);
    } catch (err) {
      // silent fail — initial server-rendered data is fine
    }
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!niche.trim()) {
      toast.error("Tell us your niche first");
      return;
    }
    setLoading(true);
    toast.info("Generating ideas... AI is thinking (takes ~30s)", { duration: 8000 });
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          platform,
          tone: tone || undefined,
          count,
          generate: true,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status}. ${text.slice(0, 100) || "Try again — the AI may be busy."}`);
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      toast.success(`Generated ${data.ideas.length} ideas ✨`);
      // Prepend new ideas to bank
      const newIdeas: Idea[] = data.ideas.map((i: any) => ({
        ...i,
        createdAt: new Date(i.createdAt).toISOString(),
        updatedAt: new Date(i.updatedAt).toISOString(),
      }));
      setIdeas([...newIdeas, ...ideas]);
      // Smooth-scroll to the newly generated section
      setTimeout(() => {
        document.getElementById("fresh-ideas")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to generate ideas");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: IdeaStatus) {
    setUpdatingIds((s) => new Set(s).add(id));
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setIdeas((curr) =>
        curr.map((i) => (i.id === id ? { ...i, status } : i))
      );
      const cfg = statusConfig[status];
      toast.success(`Marked as ${cfg.label}`, {
        description: cfg.label === "Published" ? "🎉 Time to ship the next one." : undefined,
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update");
    } finally {
      setUpdatingIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  }

  async function deleteIdea(id: string) {
    if (!confirm("Delete this idea?")) return;
    try {
      const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setIdeas((curr) => curr.filter((i) => i.id !== id));
      toast.success("Idea deleted");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete");
    }
  }

  // Split ideas: new (just generated, status "idea", within last 5 min) vs bank
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const freshIdeas = ideas.filter(
    (i) => i.status === "idea" && new Date(i.createdAt).getTime() > fiveMinAgo
  );
  const bankIdeas = bankFilter === "all" ? ideas : ideas.filter((i) => i.status === bankFilter);

  // Status counts
  const statusCounts: Record<IdeaStatus | "all", number> = {
    all: ideas.length,
    idea: ideas.filter((i) => i.status === "idea").length,
    filmed: ideas.filter((i) => i.status === "filmed").length,
    published: ideas.filter((i) => i.status === "published").length,
    killed: ideas.filter((i) => i.status === "killed").length,
  };

  return (
    <div className="space-y-10">
      {/* Generator form */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl brand-gradient flex items-center justify-center text-white">
            <Wand2 className="h-4 w-4" />
          </div>
          <h2 className="font-display text-xl font-bold">Generate fresh ideas</h2>
        </div>

        <form onSubmit={onGenerate} className="space-y-6">
          {/* Niche */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Your niche</Label>
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
                      : "border-border bg-background text-muted-foreground hover:border-brand/40"
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
            />
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Platform</Label>
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
                      : "border-border bg-background hover:border-brand/40"
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
            <Label className="text-base font-semibold">
              Tone <span className="text-muted-foreground font-normal text-xs">(optional — leave blank for a mix)</span>
            </Label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTone("")}
                className={cn(
                  "p-3 rounded-xl border text-left transition",
                  tone === ""
                    ? "border-brand bg-brand/5 shadow-md shadow-brand/5"
                    : "border-border bg-background hover:border-brand/40"
                )}
              >
                <div className="font-semibold text-sm">Mixed</div>
                <div className="text-xs text-muted-foreground mt-0.5">Variety across all tones</div>
              </button>
              {tones.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition",
                    tone === t.id
                      ? "border-brand bg-brand/5 shadow-md shadow-brand/5"
                      : "border-border bg-background hover:border-brand/40"
                  )}
                >
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">How many ideas?</Label>
            <div className="flex gap-2">
              {[4, 6, 8, 10].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={cn(
                    "h-10 w-12 rounded-lg border font-semibold text-sm transition",
                    count === c
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background text-muted-foreground hover:border-brand/40"
                  )}
                >
                  {c}
                </button>
              ))}
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
                  Generating {count} ideas...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {count} ideas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by Z.AI GLM-4.6. All generated ideas are saved to your bank automatically.
          </p>
        </form>
      </div>

      {/* Fresh ideas (just generated) */}
      {freshIdeas.length > 0 && (
        <section id="fresh-ideas">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-brand" />
            <h2 className="font-display text-xl font-bold">Freshly generated</h2>
            <Badge variant="secondary" className="bg-brand/10 text-brand">
              {freshIdeas.length} new
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {freshIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onUpdateStatus={updateStatus}
                onDelete={deleteIdea}
                updating={updatingIds.has(idea.id)}
                highlight
              />
            ))}
          </div>
        </section>
      )}

      {/* Idea bank */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-brand-pink" />
            <h2 className="font-display text-xl font-bold">Your idea bank</h2>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {ideas.length} total
            </Badge>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            {(["all", "idea", "filmed", "published", "killed"] as const).map((s) => {
              const cfg = s === "all" ? null : statusConfig[s];
              const active = bankFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setBankFilter(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium border transition",
                    active
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background text-muted-foreground hover:border-brand/40"
                  )}
                >
                  {s === "all" ? "All" : cfg?.label}
                  <span className="ml-1 opacity-60">{statusCounts[s]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {bankIdeas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="inline-flex h-14 w-14 rounded-2xl brand-gradient items-center justify-center text-white mb-4">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold">
              {ideas.length === 0 ? "Your idea bank is empty" : "No ideas match this filter"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {ideas.length === 0
                ? "Generate your first batch of ideas above — they'll land here automatically."
                : `Try a different filter — you have ${ideas.length} ideas total.`}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {bankIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onUpdateStatus={updateStatus}
                onDelete={deleteIdea}
                updating={updatingIds.has(idea.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function IdeaCard({
  idea,
  onUpdateStatus,
  onDelete,
  updating,
  highlight = false,
}: {
  idea: Idea;
  onUpdateStatus: (id: string, status: IdeaStatus) => void;
  onDelete: (id: string) => void;
  updating: boolean;
  highlight?: boolean;
}) {
  const cfg = statusConfig[idea.status as IdeaStatus];
  const StatusIcon = cfg?.icon ?? Lightbulb;
  const formatColor = formatColors[idea.format.toLowerCase()] ?? "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card p-5 transition-all",
        highlight
          ? "border-brand/40 shadow-md shadow-brand/10"
          : "border-border hover:border-brand/30 hover:shadow-md hover:shadow-brand/5"
      )}
    >
      {/* Top row: format + status */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn("text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded", formatColor)}>
          {idea.format}
        </span>
        <span className={cn("text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border", cfg.color)}>
          <StatusIcon className="inline h-3 w-3 mr-1" />
          {cfg.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-bold leading-tight">{idea.title}</h3>

      {/* Hook preview */}
      <div className="mt-3 rounded-lg bg-brand/5 border border-brand/15 p-2.5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-brand mb-1">Hook</div>
        <p className="text-sm italic text-foreground/90">"{idea.hookPreview}"</p>
      </div>

      {/* Angle */}
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {idea.angle}
      </p>

      {/* Footer: meta + actions */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {idea.niche}
        </span>
        <div className="flex items-center gap-1">
          {/* Status cycle buttons */}
          <StatusButton
            label="Idea"
            icon={Lightbulb}
            active={idea.status === "idea"}
            onClick={() => onUpdateStatus(idea.id, "idea")}
            disabled={updating || idea.status === "idea"}
            color="brand"
          />
          <StatusButton
            label="Filmed"
            icon={Film}
            active={idea.status === "filmed"}
            onClick={() => onUpdateStatus(idea.id, "filmed")}
            disabled={updating || idea.status === "filmed"}
            color="amber"
          />
          <StatusButton
            label="Published"
            icon={Send}
            active={idea.status === "published"}
            onClick={() => onUpdateStatus(idea.id, "published")}
            disabled={updating || idea.status === "published"}
            color="green"
          />
          <StatusButton
            label="Killed"
            icon={X}
            active={idea.status === "killed"}
            onClick={() => onUpdateStatus(idea.id, "killed")}
            disabled={updating || idea.status === "killed"}
            color="red"
          />
          <button
            onClick={() => onDelete(idea.id)}
            disabled={updating}
            className="ml-1 p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
            aria-label="Delete idea"
            title="Delete idea"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusButton({
  label,
  icon: Icon,
  active,
  onClick,
  disabled,
  color,
}: {
  label: string;
  icon: any;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  color: "brand" | "amber" | "green" | "red";
}) {
  const colorClasses = {
    brand: "text-brand hover:bg-brand/10",
    amber: "text-amber-600 hover:bg-amber-500/10",
    green: "text-green-600 hover:bg-green-500/10",
    red: "text-red-600 hover:bg-red-500/10",
  }[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={`Mark as ${label}`}
      aria-label={`Mark as ${label}`}
      className={cn(
        "p-1.5 rounded transition disabled:opacity-30 disabled:cursor-not-allowed",
        active ? "opacity-30 cursor-not-allowed" : colorClasses
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
