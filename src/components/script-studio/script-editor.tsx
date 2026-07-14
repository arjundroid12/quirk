"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Save,
  Trash2,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Wand2,
  PenLine,
  Download,
  Film,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScriptData {
  id: string;
  title: string;
  content: string;
  platform: string;
  tone: string;
  niche: string;
  cta: string | null;
  tags: string | null;
  status?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const platformLabel: Record<string, string> = {
  reels: "Reels",
  shorts: "Shorts",
  tiktok: "TikTok",
  longform: "Long-form",
  carousel: "Carousel",
};

const toneLabel: Record<string, string> = {
  casual: "Casual",
  hype: "Hype",
  educational: "Educational",
  storytelling: "Storytelling",
  authoritative: "Authoritative",
};

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  draft: { label: "Draft", icon: PenLine, color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  filming: { label: "Filming", icon: Film, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  filmed: { label: "Filmed", icon: CircleDot, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  published: { label: "Published", icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

const statusOrder = ["draft", "filming", "filmed", "published"];

export function ScriptEditor({ script, autoHumanize }: { script: ScriptData; autoHumanize?: boolean })  {
  const router = useRouter();
  const [title, setTitle] = useState(script.title);
  const [content, setContent] = useState(script.content);
  const [status, setStatus] = useState(script.status || "draft");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [humanizing, setHumanizing] = useState(false);
  const [improvingSection, setImprovingSection] = useState<string | null>(null);

  // Auto-trigger humanize if coming from ?humanize=1
  useEffect(() => {
    if (autoHumanize && !humanizing) {
      onHumanize();
    }
  }, [autoHumanize]);

  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => { void save(true); }, 1500);
    return () => clearTimeout(t);
  }, [title, content, dirty]);

  async function save(silent = false) {
    setSaving(true);
    try {
      const res = await fetch(`/api/scripts/${script.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status}. ${text.slice(0, 100) || "Try again."}`);
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setSavedAt(new Date());
      setDirty(false);
      if (!silent) toast.success("Saved");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(newStatus: string) {
    try {
      const res = await fetch(`/api/scripts/${script.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setStatus(newStatus);
      toast.success(`Status: ${statusConfig[newStatus]?.label ?? newStatus}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update status");
    }
  }

  async function onDelete() {
    if (!confirm("Delete this script? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/scripts/${script.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      toast.success("Script deleted");
      router.push("/app/scripts");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete");
    }
  }

  async function onCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  async function onDownload() {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  }

  async function onHumanize() {
    if (!confirm("This will rewrite the entire script to evade AI detection. Your current content will be replaced. Continue?")) return;
    setHumanizing(true);
    toast.info("Humanizing... AI is rewriting (takes ~30s)", { duration: 8000 });
    try {
      const res = await fetch("/api/scripts/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "body",
          current: content,
          niche: script.niche,
          platform: script.platform,
          tone: script.tone,
          instruction: "Humanize this entire script to evade AI detection. Use short sentences (avg 14-17 words). 30%+ of sentences ≤8 words. No sentence over 22 words. Plain vocabulary. Kill AI words (delve, leverage, utilize, etc.). Keep all facts. Output ONLY the rewritten script.",
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status}. ${text.slice(0, 100) || "Try again."}`);
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setContent(data.improved);
      setDirty(true);
      toast.success("Script humanized 🧬");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to humanize");
    } finally {
      setHumanizing(false);
    }
  }

  async function improveSection(section: "hook" | "body" | "cta") {
    setImprovingSection(section);
    const markers: Record<string, { start: string; end: string }> = {
      hook: { start: "**Hook:**", end: "" },
      body: { start: "", end: "**CTA:**" },
      cta: { start: "**CTA:**", end: "**Hashtags:**" },
    };
    const m = markers[section];
    const lines = content.split("\n");
    let startIdx = -1;
    let endIdx = lines.length;
    for (let i = 0; i < lines.length; i++) {
      if (startIdx === -1 && m.start && lines[i].includes(m.start)) { startIdx = i; }
      else if (startIdx !== -1 && m.end && lines[i].includes(m.end)) { endIdx = i; break; }
    }
    let current = "";
    if (startIdx !== -1) {
      const block = lines.slice(startIdx, endIdx).join("\n");
      current = block.replace(/^\*\*Hook:\*\*\s*/i, "").replace(/^\*\*CTA:\*\*\s*/i, "").trim();
    } else { current = content.trim(); }
    if (!current) { toast.error(`Couldn't find ${section} section`); setImprovingSection(null); return; }

    const toastId = toast.loading(`Improving ${section}... (takes ~30s)`, { duration: 60000 });
    try {
      const res = await fetch("/api/scripts/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, current, niche: script.niche, platform: script.platform, tone: script.tone }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status}. ${text.slice(0, 100) || "Try again."}`);
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      const improved = data.improved as string;
      let newContent = content;
      if (section === "hook" && startIdx !== -1) {
        lines[startIdx] = `**Hook:** ${improved}`;
        newContent = lines.join("\n");
      } else if (section === "cta" && startIdx !== -1) {
        lines[startIdx] = `**CTA:** ${improved}`;
        newContent = lines.join("\n");
      } else if (section === "body" && startIdx !== -1) {
        const before = lines.slice(0, startIdx + 1);
        const after = lines.slice(endIdx);
        newContent = [...before, improved, ...after].join("\n");
      } else { newContent = improved; }
      setContent(newContent);
      setDirty(true);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} improved ✨`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to improve", { id: toastId });
    } finally {
      setImprovingSection(null);
    }
  }

  const hashtags = script.tags ? script.tags.split(",").filter(Boolean).map((t) => "#" + t.trim()) : [];
  const StatusIcon = statusConfig[status]?.icon ?? PenLine;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/app/scripts" className="hover:text-foreground">Scripts</Link>
        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
        <span className="truncate max-w-[200px]">{title || "Untitled"}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-brand/10 text-brand hover:bg-brand/15">
              {platformLabel[script.platform] ?? script.platform}
            </Badge>
            <Badge variant="secondary" className="bg-brand-pink/10 text-brand-pink hover:bg-brand-pink/15">
              {toneLabel[script.tone] ?? script.tone}
            </Badge>
            <Badge variant="outline">{script.niche}</Badge>
            <Badge
              variant="secondary"
              className="hover:opacity-80"
              style={{ background: statusConfig[status]?.bg, color: statusConfig[status]?.color }}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig[status]?.label ?? status}
            </Badge>
          </div>
          <Input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
            className="text-2xl font-display font-bold border-0 px-0 h-auto focus-visible:ring-0"
          />
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Created {new Date(script.createdAt).toLocaleDateString()}</span>
            {savedAt && (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" /> Saved {savedAt.toLocaleTimeString()}
              </span>
            )}
            {saving && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Download</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving || !dirty}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">Save</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Editor */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <PenLine className="h-4 w-4 text-brand" /> Script
            </div>
            <div className="flex items-center gap-1">
              {(["hook", "body", "cta"] as const).map((s) => (
                <Button key={s} size="sm" variant="ghost" onClick={() => improveSection(s)} disabled={!!improvingSection}
                  className="text-xs h-8">
                  {improvingSection === s ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3 text-brand" />}
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setDirty(true); }}
            className="min-h-[60vh] border-0 rounded-none focus-visible:ring-0 font-mono text-sm leading-relaxed resize-none p-5"
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Status pipeline */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Status Pipeline
            </div>
            <div className="space-y-1.5">
              {statusOrder.map((s, i) => {
                const cfg = statusConfig[s];
                const Icon = cfg.icon;
                const isActive = status === s;
                const isPast = statusOrder.indexOf(status) > i;
                return (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                      isActive ? "font-semibold" : "font-normal hover:bg-muted",
                    )}
                    style={isActive ? { background: cfg.bg, color: cfg.color } : {}}
                  >
                    <Icon className="h-4 w-4" style={{ color: isActive || isPast ? cfg.color : undefined }} />
                    {cfg.label}
                    {isActive && <Check className="h-3 w-3 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI tools */}
          <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="h-4 w-4 text-brand" />
              <span className="font-semibold text-sm">AI tools</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Improve any section or humanize the entire script to evade AI detection.
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start bg-background" onClick={() => improveSection("hook")} disabled={!!improvingSection}>
                <Sparkles className="mr-2 h-3.5 w-3.5 text-brand" /> Rewrite hook
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-background" onClick={() => improveSection("body")} disabled={!!improvingSection}>
                <Sparkles className="mr-2 h-3.5 w-3.5 text-brand" /> Rewrite body
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-background" onClick={() => improveSection("cta")} disabled={!!improvingSection}>
                <Sparkles className="mr-2 h-3.5 w-3.5 text-brand" /> Rewrite CTA
              </Button>
              <div className="h-px bg-border my-2" />
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-brand/5 border-brand/30 text-brand hover:bg-brand/10"
                onClick={onHumanize}
                disabled={humanizing}
              >
                {humanizing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Wand2 className="mr-2 h-3.5 w-3.5" />}
                {humanizing ? "Humanizing..." : "Humanize (anti-AI detection)"}
              </Button>
            </div>
          </div>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Hashtags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((h) => (
                  <span key={h} className="text-xs font-mono text-brand bg-brand/10 px-2 py-1 rounded">{h}</span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Platform</span><span className="font-medium">{platformLabel[script.platform] ?? script.platform}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tone</span><span className="font-medium">{toneLabel[script.tone] ?? script.tone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Niche</span><span className="font-medium">{script.niche}</span></div>
            {script.cta && (
              <div className="pt-2 border-t border-border">
                <div className="text-muted-foreground mb-1">CTA</div>
                <div className="font-medium">{script.cta}</div>
              </div>
            )}
          </div>

          <Button asChild variant="outline" className="w-full" size="sm">
            <Link href="/app/scripts/new"><Sparkles className="mr-1.5 h-4 w-4" /> Generate another</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
