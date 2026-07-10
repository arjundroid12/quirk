"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  X,
  Crown,
  Upload,
  Wand2,
  History,
  AlertCircle,
} from "lucide-react";

interface ThumbItem {
  id: string;
  imageData: string;
  fileName: string | null;
  score: number;
  compositionScore: number;
  emotionScore: number;
  textLegibilityScore: number;
  ctrPrediction: number;
  reasoning: string;
  isWinner: boolean;
  createdAt: string;
}

interface Batch {
  batchId: string;
  createdAt: string;
  thumbnails: ThumbItem[];
}

const MAX_IMAGES = 3;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface PendingImage {
  dataUrl: string;
  fileName: string;
  previewUrl: string;
}

export function ThumbnailTester({ initialBatches }: { initialBatches: Batch[] }) {
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // Refresh on mount in case stale
    fetch("/api/thumbnails")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setBatches(data.batches);
      })
      .catch(() => {});
  }, []);

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const arr = Array.from(files);
    const valid: PendingImage[] = [];

    for (const file of arr) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not an image. Skipping.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" is too large (max 5MB). Skipping.`);
        continue;
      }
      const dataUrl = await readFileAsDataUrl(file);
      valid.push({ dataUrl, fileName: file.name, previewUrl: dataUrl });
    }

    const total = pending.length + valid.length;
    if (total > MAX_IMAGES) {
      const allowed = MAX_IMAGES - pending.length;
      if (allowed <= 0) {
        setError(`You can only analyze ${MAX_IMAGES} images at a time. Remove one first.`);
        return;
      }
      setPending([...pending, ...valid.slice(0, allowed)]);
      setError(`Only added ${allowed} of ${valid.length} images (max ${MAX_IMAGES} per batch).`);
    } else {
      setPending([...pending, ...valid]);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      void handleFiles(e.dataTransfer.files);
    }
  }

  function removePending(idx: number) {
    setPending(pending.filter((_, i) => i !== idx));
  }

  async function onAnalyze() {
    if (pending.length < 2) {
      setError("Upload at least 2 thumbnails to compare.");
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: pending.map((p) => ({ dataUrl: p.dataUrl, fileName: p.fileName })),
          niche: niche || undefined,
          platform: platform || undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      const batch: Batch = {
        batchId: data.batchId,
        createdAt: new Date().toISOString(),
        thumbnails: data.thumbnails.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt).toISOString(),
        })),
      };
      setCurrentBatch(batch);
      setBatches([batch, ...batches]);
      setPending([]);
      toast.success(`Analyzed ${batch.thumbnails.length} thumbnails 🎉 Winner: score ${batch.thumbnails.find((t) => t.isWinner)?.score}`);
      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to analyze");
      setError(err?.message ?? "Failed to analyze");
    } finally {
      setAnalyzing(false);
    }
  }

  async function deleteBatch(batchId: string) {
    if (!confirm("Delete this batch? All thumbnails in it will be removed.")) return;
    try {
      const batch = batches.find((b) => b.batchId === batchId);
      if (!batch) return;
      await Promise.all(
        batch.thumbnails.map((t) =>
          fetch(`/api/thumbnails/${t.id}`, { method: "DELETE" })
        )
      );
      setBatches(batches.filter((b) => b.batchId !== batchId));
      if (currentBatch?.batchId === batchId) setCurrentBatch(null);
      toast.success("Batch deleted");
    } catch (err: any) {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-10">
      {/* Upload + Analyze section */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl brand-gradient flex items-center justify-center text-white">
            <Wand2 className="h-4 w-4" />
          </div>
          <h2 className="font-display text-xl font-bold">Upload thumbnails to test</h2>
        </div>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all",
            dragOver
              ? "border-brand bg-brand/5"
              : "border-border hover:border-brand/50 hover:bg-brand/[0.02]"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="inline-flex h-14 w-14 rounded-2xl brand-gradient items-center justify-center text-white mb-3">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Drop thumbnails here</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse · PNG/JPG/WebP · max 5MB each · 2-3 images per batch
          </p>
        </div>

        {/* Pending previews */}
        {pending.length > 0 && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pending.map((p, i) => (
              <div
                key={i}
                className="group relative rounded-xl overflow-hidden border border-border bg-background aspect-video"
              >
                <img
                  src={p.previewUrl}
                  alt={p.fileName}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePending(i)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] font-mono truncate px-2 py-1">
                  {p.fileName}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optional context */}
        {pending.length > 0 && (
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="niche" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Niche (optional)
              </Label>
              <Input
                id="niche"
                placeholder="e.g. tech reviews"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Platform (optional)
              </Label>
              <Input
                id="platform"
                placeholder="e.g. YouTube long-form"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Analyze button */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onAnalyze}
            disabled={analyzing || pending.length < 2}
            size="lg"
            className="brand-gradient text-white hover:opacity-90"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing {pending.length} thumbnails...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze {pending.length || ""} {pending.length === 1 ? "thumbnail" : "thumbnails"}
              </>
            )}
          </Button>
          {pending.length > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPending([])}
              disabled={analyzing}
            >
              Clear all
            </Button>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Powered by Z.AI GLM-4.6 Vision. Each analysis takes ~5-10 seconds.
        </p>
      </div>

      {/* Current results */}
      {currentBatch && (
        <section id="results">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-brand" />
            <h2 className="font-display text-xl font-bold">Analysis results</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentBatch.thumbnails.map((t) => (
              <ThumbnailResultCard key={t.id} thumb={t} />
            ))}
          </div>
        </section>
      )}

      {/* Past analyses */}
      {batches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-brand-pink" />
            <h2 className="font-display text-xl font-bold">Past analyses</h2>
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {batches.length} batch{batches.length === 1 ? "" : "es"}
            </span>
          </div>
          <div className="space-y-3">
            {batches.map((batch) => (
              <PastBatchCard
                key={batch.batchId}
                batch={batch}
                onView={() => {
                  setCurrentBatch(batch);
                  setTimeout(() => {
                    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                onDelete={() => deleteBatch(batch.batchId)}
                isActive={currentBatch?.batchId === batch.batchId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state for no batches at all */}
      {batches.length === 0 && !currentBatch && (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl brand-gradient items-center justify-center text-white mb-4">
            <ImagePlus className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold">No analyses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Upload 2-3 thumbnails above to get your first AI analysis. Each batch is saved here for future reference.
          </p>
        </div>
      )}
    </div>
  );
}

function ThumbnailResultCard({ thumb }: { thumb: ThumbItem }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card overflow-hidden transition-all",
        thumb.isWinner
          ? "border-amber-500/50 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/40"
          : "border-border"
      )}
    >
      {/* Winner banner */}
      {thumb.isWinner && (
        <div className="absolute top-0 inset-x-0 z-10 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white text-center py-1.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md">
          <Crown className="h-3.5 w-3.5" />
          Winner
        </div>
      )}

      {/* Image */}
      <div className={cn("relative aspect-video bg-muted", thumb.isWinner && "pt-7")}>
        <img
          src={thumb.imageData}
          alt={thumb.fileName ?? "thumbnail"}
          className="w-full h-full object-cover"
        />
        {/* Overall score badge */}
        <div className="absolute bottom-2 right-2 rounded-lg brand-gradient text-white px-2.5 py-1.5 shadow-lg">
          <div className="text-[9px] font-mono uppercase tracking-widest opacity-80">Score</div>
          <div className="font-bold text-lg leading-none">{thumb.score}</div>
        </div>
      </div>

      {/* Scores */}
      <div className="p-4 space-y-3">
        <ScoreBar label="Composition" value={thumb.compositionScore} max={100} suffix="/100" />
        <ScoreBar label="Emotion" value={thumb.emotionScore} max={100} suffix="/100" />
        <ScoreBar label="Text legibility" value={thumb.textLegibilityScore} max={100} suffix="/100" />
        <ScoreBar label="Predicted CTR" value={thumb.ctrPrediction} max={5} suffix="%" />

        {/* Reasoning */}
        <div className="pt-2 border-t border-border">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            AI reasoning
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">{thumb.reasoning}</p>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colorClass =
    pct >= 75
      ? "from-green-500 to-emerald-500"
      : pct >= 50
      ? "from-brand to-brand-pink"
      : pct >= 25
      ? "from-amber-500 to-orange-500"
      : "from-red-500 to-rose-500";

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">
          {value.toFixed(1)}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full bg-gradient-to-r transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PastBatchCard({
  batch,
  onView,
  onDelete,
  isActive,
}: {
  batch: Batch;
  onView: () => void;
  onDelete: () => void;
  isActive: boolean;
}) {
  const winner = batch.thumbnails.find((t) => t.isWinner);
  const date = new Date(batch.createdAt);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 flex items-center gap-4 transition",
        isActive ? "border-brand shadow-md shadow-brand/10" : "border-border hover:border-brand/40"
      )}
    >
      {/* Thumbnails strip */}
      <div className="flex -space-x-2 shrink-0">
        {batch.thumbnails.slice(0, 3).map((t) => (
          <div
            key={t.id}
            className="h-12 w-20 rounded-md overflow-hidden border-2 border-background bg-muted relative"
          >
            <img src={t.imageData} alt="" className="w-full h-full object-cover" />
            {t.isWinner && (
              <div className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-amber-500 flex items-center justify-center">
                <Crown className="h-2 w-2 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">
          {batch.thumbnails.length} thumbnails · winner score{" "}
          <span className="text-brand">{winner?.score ?? "—"}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
          at {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="outline" size="sm" onClick={onView}>
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete batch"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
