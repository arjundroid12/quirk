"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Copy, Check, TrendingUp, Hash, Zap, Scissors } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tool = "score" | "repurpose" | "hashtags" | "hooks";

const tools: Record<Tool, { name: string; icon: any; desc: string; color: string }> = {
  score: { name: "Script Scorer", icon: TrendingUp, desc: "AI rates your script before you film", color: "from-emerald-500 to-teal-500" },
  repurpose: { name: "Content Repurposer", icon: Scissors, desc: "Turn 1 long-form into multiple shorts", color: "from-blue-500 to-cyan-500" },
  hashtags: { name: "Hashtag Generator", icon: Hash, desc: "3-tier hashtag strategy for any topic", color: "from-fuchsia-500 to-pink-500" },
  hooks: { name: "Hook Generator", icon: Zap, desc: "10 psychological hook variations", color: "from-amber-500 to-orange-500" },
};

export function ToolsHub() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  if (!activeTool) {
    return (
      <div>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" /> Tools
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">AI Tools</h1>
          <p className="mt-2 text-muted-foreground">Standalone AI tools for specific creator tasks.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(tools) as Tool[]).map((key) => {
            const t = tools[key];
            const Icon = t.icon;
            return (
              <button key={key} onClick={() => setActiveTool(key)} className="group text-left rounded-2xl border border-border bg-card p-6 hover:border-brand/40 hover:shadow-lg transition-all">
                <div className={cn("h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4", t.color)}><Icon className="h-5 w-5" /></div>
                <h3 className="font-display font-bold text-lg group-hover:text-brand transition-colors">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const t = tools[activeTool];
  const Icon = t.icon;
  return (
    <div>
      <button onClick={() => setActiveTool(null)} className="text-sm text-muted-foreground hover:text-foreground mb-4">← Back to tools</button>
      <div className="mb-8">
        <div className={cn("h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4", t.color)}><Icon className="h-5 w-5" /></div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t.name}</h1>
        <p className="mt-2 text-muted-foreground">{t.desc}</p>
      </div>
      {activeTool === "score" && <ScriptScorer />}
      {activeTool === "repurpose" && <ContentRepurposer />}
      {activeTool === "hashtags" && <HashtagGenerator />}
      {activeTool === "hooks" && <HookGenerator />}
    </div>
  );
}

function ScriptScorer() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("reels");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<any>(null);

  async function run() {
    if (!content.trim() || !niche.trim()) { toast.error("Fill in niche and script"); return; }
    setLoading(true); setScore(null);
    toast.info("Scoring script... (takes ~30s)", { duration: 8000 });
    try {
      const res = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, platform, niche }) });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.ok) setScore(data.score); else throw new Error(data.error);
    } catch (err: any) { toast.error(err?.message ?? "Failed"); }
    setLoading(false);
  }

  const scoreBar = (label: string, value: number, color: string) => (
    <div>
      <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{label}</span><span className="font-bold">{Math.round(value)}</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Niche</Label><Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. fitness, tech, cooking" /></div>
        <div><Label>Platform</Label><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="reels">Reels</option><option value="shorts">Shorts</option><option value="tiktok">TikTok</option><option value="longform">Long-form</option></select></div>
      </div>
      <div><Label>Script content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste your script here..." className="min-h-[200px] font-mono text-sm" /></div>
      <Button onClick={run} disabled={loading} className="brand-gradient text-white">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Score my script</Button>
      {score && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="text-center"><div className="text-5xl font-bold font-display" style={{ color: score.overall >= 70 ? "#10b981" : score.overall >= 50 ? "#f59e0b" : "#ef4444" }}>{Math.round(score.overall)}</div><div className="text-sm text-muted-foreground">Overall score</div></div>
          <div className="grid sm:grid-cols-2 gap-4">
            {scoreBar("Hook strength", score.hookStrength, "#8b5cf6")}
            {scoreBar("Pacing", score.pacing, "#3b82f6")}
            {scoreBar("CTA strength", score.ctaStrength, "#f59e0b")}
            {scoreBar("Retention", score.retention, "#10b981")}
          </div>
          <div><div className="text-sm font-semibold mb-1">Feedback</div><p className="text-sm text-muted-foreground">{score.feedback}</p></div>
          {score.improvements?.length > 0 && (<div><div className="text-sm font-semibold mb-2">Improvements</div><ul className="space-y-1">{score.improvements.map((imp: string, i: number) => <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-brand">•</span>{imp}</li>)}</ul></div>)}
        </div>
      )}
    </div>
  );
}

function ContentRepurposer() {
  const [content, setContent] = useState("");
  const [niche, setNiche] = useState("");
  const [targetPlatform, setTargetPlatform] = useState("reels");
  const [clipCount, setClipCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [clips, setClips] = useState<any[]>([]);

  async function run() {
    if (!content.trim() || !niche.trim()) { toast.error("Fill in niche and content"); return; }
    setLoading(true); setClips([]);
    toast.info("Repurposing content... (takes ~30s)", { duration: 8000 });
    try {
      const res = await fetch("/api/repurpose", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, niche, targetPlatform, clipCount }) });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.ok) setClips(data.clips); else throw new Error(data.error);
    } catch (err: any) { toast.error(err?.message ?? "Failed"); }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div><Label>Niche</Label><Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. productivity" /></div>
        <div><Label>Target platform</Label><select value={targetPlatform} onChange={(e) => setTargetPlatform(e.target.value)} className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="reels">Reels</option><option value="shorts">Shorts</option><option value="tiktok">TikTok</option></select></div>
        <div><Label>Number of clips</Label><select value={clipCount} onChange={(e) => setClipCount(Number(e.target.value))} className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"><option value={2}>2 clips</option><option value={3}>3 clips</option><option value={4}>4 clips</option><option value={5}>5 clips</option></select></div>
      </div>
      <div><Label>Long-form content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste your long-form script, blog post, or article here..." className="min-h-[200px] font-mono text-sm" /></div>
      <Button onClick={run} disabled={loading} className="brand-gradient text-white">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scissors className="mr-2 h-4 w-4" />}Repurpose into {clipCount} clips</Button>
      {clips.length > 0 && (<div className="space-y-4">{clips.map((clip, i) => <ClipCard key={i} clip={clip} index={i} />)}</div>)}
    </div>
  );
}

function ClipCard({ clip, index }: { clip: any; index: number }) {
  const [copied, setCopied] = useState(false);
  const fullText = `# ${clip.title}\n\n**Hook:** ${clip.hook}\n\n${clip.body}\n\n**CTA:** ${clip.cta}\n\n> Timestamp: ${clip.timestamp}`;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div><Badge variant="secondary" className="mb-2">Clip {index + 1} · {clip.timestamp}</Badge><h3 className="font-display font-bold text-lg">{clip.title}</h3></div>
        <Button variant="ghost" size="sm" onClick={async () => { await navigator.clipboard.writeText(fullText); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
      </div>
      <div className="space-y-2 text-sm"><div><span className="text-muted-foreground">Hook:</span> {clip.hook}</div><div><span className="text-muted-foreground">Body:</span> {clip.body}</div><div><span className="text-muted-foreground">CTA:</span> {clip.cta}</div></div>
    </div>
  );
}

function HashtagGenerator() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("reels");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function run() {
    if (!topic.trim() || !niche.trim()) { toast.error("Fill in topic and niche"); return; }
    setLoading(true); setResult(null);
    toast.info("Generating hashtags... (takes ~20s)", { duration: 8000 });
    try {
      const res = await fetch("/api/hashtags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, niche, platform }) });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.ok) setResult(data.hashtags); else throw new Error(data.error);
    } catch (err: any) { toast.error(err?.message ?? "Failed"); }
    setLoading(false);
  }

  const TagGroup = ({ title, tags, color }: { title: string; tags: string[]; color: string }) => (
    <div><div className="text-sm font-semibold mb-2">{title}</div><div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t} className={cn("text-xs font-mono px-2.5 py-1.5 rounded-lg", color)}>#{t}</span>)}</div></div>
  );

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div><Label>Topic</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. morning workout" /></div>
        <div><Label>Niche</Label><Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. fitness" /></div>
        <div><Label>Platform</Label><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="reels">Reels</option><option value="shorts">Shorts</option><option value="tiktok">TikTok</option><option value="longform">Long-form</option></select></div>
      </div>
      <Button onClick={run} disabled={loading} className="brand-gradient text-white">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hash className="mr-2 h-4 w-4" />}Generate hashtags</Button>
      {result && (
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <TagGroup title="Primary (topic-specific)" tags={result.primary} color="bg-brand/10 text-brand" />
          <TagGroup title="Secondary (niche)" tags={result.secondary} color="bg-brand-pink/10 text-brand-pink" />
          <TagGroup title="Trending" tags={result.trending} color="bg-amber-500/10 text-amber-600" />
          <div><div className="text-sm font-semibold mb-1">Strategy</div><p className="text-sm text-muted-foreground">{result.strategy}</p></div>
          <Button variant="outline" size="sm" onClick={() => { const all = [...result.primary, ...result.secondary, ...result.trending].map((t: string) => `#${t}`).join(" "); navigator.clipboard.writeText(all); toast.success("All hashtags copied"); }}>Copy all</Button>
        </div>
      )}
    </div>
  );
}

function HookGenerator() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("reels");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<any[]>([]);

  async function run() {
    if (!topic.trim() || !niche.trim()) { toast.error("Fill in topic and niche"); return; }
    setLoading(true); setHooks([]);
    toast.info("Generating hooks... (takes ~20s)", { duration: 8000 });
    try {
      const res = await fetch("/api/hooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, niche, platform, count }) });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.ok) setHooks(data.hooks); else throw new Error(data.error);
    } catch (err: any) { toast.error(err?.message ?? "Failed"); }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Topic</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. AI tools for productivity" /></div>
        <div><Label>Niche</Label><Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. tech" /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Platform</Label><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="reels">Reels</option><option value="shorts">Shorts</option><option value="tiktok">TikTok</option></select></div>
        <div><Label>Number of hooks</Label><select value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"><option value={3}>3 hooks</option><option value={5}>5 hooks</option><option value={7}>7 hooks</option><option value={10}>10 hooks</option></select></div>
      </div>
      <Button onClick={run} disabled={loading} className="brand-gradient text-white">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}Generate {count} hooks</Button>
      {hooks.length > 0 && (<div className="space-y-3">{hooks.map((h, i) => <HookCard key={i} hook={h} index={i} />)}</div>)}
    </div>
  );
}

function HookCard({ hook, index }: { hook: any; index: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2"><Badge variant="secondary" className="bg-amber-500/10 text-amber-600">{hook.type}</Badge></div>
          <p className="font-medium text-lg">"{hook.hook}"</p>
          <p className="mt-2 text-sm text-muted-foreground">{hook.psychology}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={async () => { await navigator.clipboard.writeText(hook.hook); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
      </div>
    </div>
  );
}
