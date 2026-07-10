"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenLine, ChevronRight } from "lucide-react";

interface ScriptListItem {
  id: string;
  title: string;
  platform: string;
  tone: string;
  niche: string;
  createdAt: string | Date;
}

const platformLabel: Record<string, string> = {
  reels: "Reels",
  shorts: "Shorts",
  tiktok: "TikTok",
  longform: "Long-form",
  carousel: "Carousel",
};

const platformColor: Record<string, string> = {
  reels: "bg-brand/10 text-brand",
  shorts: "bg-red-500/10 text-red-600",
  tiktok: "bg-foreground/10 text-foreground",
  longform: "bg-blue-500/10 text-blue-600",
  carousel: "bg-amber-500/10 text-amber-700",
};

function relTime(date: string | Date) {
  const d = new Date(date).getTime();
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ScriptList({ scripts }: { scripts: ScriptListItem[] }) {
  return (
    <div className="space-y-2">
      {scripts.map((s) => (
        <Link key={s.id} href={`/app/scripts/${s.id}`}>
          <Card className="group flex items-center gap-4 p-4 hover:border-brand/40 hover:shadow-md hover:shadow-brand/5 transition-all">
            <div className="h-10 w-10 rounded-lg brand-gradient flex items-center justify-center text-white shrink-0">
              <PenLine className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{s.title}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{relTime(s.createdAt)}</span>
                <span>·</span>
                <span className="truncate">{s.niche}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded ${
                  platformColor[s.platform] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {platformLabel[s.platform] ?? s.platform}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
