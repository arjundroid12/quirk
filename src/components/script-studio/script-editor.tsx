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

export function ScriptEditor({ script }: { script: ScriptData }) {
  const router = useRouter();
  const [title, setTitle] = useState(script.title);
  const [content, setContent] = useState(script.content);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Auto-save on idle (debounced)
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      void save(true);
    }, 1500);
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

  async function onDelete() {
    if (!confirm("Delete this script? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/scripts/${script.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
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

  async function improveSection(section: "hook" | "body" | "cta") {
    const markers: Record<string, { start: string; end: string }> = {
      hook: { start: "**Hook:**", end: "" },
      body: { start: "", end: "**CTA:**" },
      cta: { start: "**CTA:**", end: "**Hashtags:**" },
    };
    const m = markers[section];

    // Try to extract the section from markdown
    const lines = content.split("\n");
    let startIdx = -1;
    let endIdx = lines.length;
    for (let i = 0; i < lines.length; i++) {
      if (startIdx === -1 && m.start && lines[i].includes(m.start)) {
        startIdx = i;
      } else if (startIdx !== -1 && m.end && lines[i].includes(m.end)) {
        endIdx = i;
        break;
      }
    }

    let current = "";
    if (startIdx !== -1) {
      const block = lines.slice(startIdx, endIdx).join("\n");
      // strip the marker prefix on first line if present
      current = block.replace(/^\*\*Hook:\*\*\s*/i, "").replace(/^\*\*CTA:\*\*\s*/i, "").trim();
    } else {
      current = content.trim();
    }

    if (!current) {
      toast.error(`Couldn't find ${section} section`);
      return;
    }

    const toastId = toast.loading(`Improving ${section}...`);
    try {
      const res = await fetch("/api/scripts/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          current,
          niche: script.niche,
          platform: script.platform,
          tone: script.tone,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status}. ${text.slice(0, 100) || "Try again — the AI may be busy."}`);
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");

      const improved = data.improved as string;

      // Replace the section in content
      let newContent = content;
      if (section === "hook" && startIdx !== -1) {
        lines[startIdx] = `**Hook:** ${improved}`;
        newContent = lines.join("\n");
      } else if (section === "cta" && startIdx !== -1) {
        lines[startIdx] = `**CTA:** ${improved}`;
        newContent = lines.join("\n");
      } else if (section === "body" && startIdx !== -1) {
        // Replace lines between (startIdx+1) and endIdx
        const before = lines.slice(0, startIdx + 1);
        const after = lines.slice(endIdx);
        newContent = [...before, improved, ...after].join("\n");
      } else {
        newContent = improved;
      }

      setContent(newContent);
      setDirty(true);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} improved ✨`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to improve", { id: toastId });
    }
  }

  const hashtags = script.tags
    ? script.tags.split(",").filter(Boolean).map((t) => "#" + t.trim())
    : [];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/app/scripts" className="hover:text-foreground">
          Scripts
        </Link>
        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
        <span className="truncate max-w-[200px]">{title || "Untitled"}</span>
      </div>

      {/* Header */}
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
          </div>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
            className="text-2xl font-display font-bold border-0 px-0 h-auto focus-visible:ring-0"
          />
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Created {new Date(script.createdAt).toLocaleDateString()}</span>
            {savedAt && (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                Saved {savedAt.toLocaleTimeString()}
              </span>
            )}
            {saving && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => save(false)}
            disabled={saving || !dirty}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">Save</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Editor */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <PenLine className="h-4 w-4 text-brand" />
              Script
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => improveSection("hook")}
                className="text-xs h-8"
              >
                <Sparkles className="mr-1 h-3 w-3 text-brand" />
                Hook
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => improveSection("body")}
                className="text-xs h-8"
              >
                <Sparkles className="mr-1 h-3 w-3 text-brand" />
                Body
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => improveSection("cta")}
                className="text-xs h-8"
              >
                <Sparkles className="mr-1 h-3 w-3 text-brand" />
                CTA
              </Button>
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
            className="min-h-[60vh] border-0 rounded-none focus-visible:ring-0 font-mono text-sm leading-relaxed resize-none p-5"
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* AI tools */}
          <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="h-4 w-4 text-brand" />
              <span className="font-semibold text-sm">AI tools</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Improve any section of the script with one click. The AI keeps your tone and platform in mind.
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-background"
                onClick={() => improveSection("hook")}
              >
                <Sparkles className="mr-2 h-3.5 w-3.5 text-brand" />
                Rewrite hook
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-background"
                onClick={() => improveSection("body")}
              >
                <Sparkles className="mr-2 h-3.5 w-3.5 text-brand" />
                Rewrite body
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-background"
                onClick={() => improveSection("cta")}
              >
                <Sparkles className="mr-2 h-3.5 w-3.5 text-brand" />
                Rewrite CTA
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
                  <span
                    key={h}
                    className="text-xs font-mono text-brand bg-brand/10 px-2 py-1 rounded"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-medium">{platformLabel[script.platform] ?? script.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tone</span>
              <span className="font-medium">{toneLabel[script.tone] ?? script.tone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Niche</span>
              <span className="font-medium">{script.niche}</span>
            </div>
            {script.cta && (
              <div className="pt-2 border-t border-border">
                <div className="text-muted-foreground mb-1">CTA</div>
                <div className="font-medium">{script.cta}</div>
              </div>
            )}
          </div>

          <Button asChild variant="outline" className="w-full" size="sm">
            <Link href="/app/scripts/new">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Generate another
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
