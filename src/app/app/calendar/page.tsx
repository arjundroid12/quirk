"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Loader2, PenLine, Film, CircleDot, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScriptData {
  id: string;
  title: string;
  content: string;
  platform: string;
  niche: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: "Draft", color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: PenLine },
  filming: { label: "Filming", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Film },
  filmed: { label: "Filmed", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: CircleDot },
  published: { label: "Published", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle2 },
};

const platformColors: Record<string, string> = {
  reels: "#8b5cf6",
  shorts: "#ef4444",
  tiktok: "#000000",
  longform: "#3b82f6",
  carousel: "#ec4899",
};

export default function CalendarPage() {
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/scripts", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.ok) setScripts(data.scripts);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Group scripts by date (using createdAt)
  const scriptsByDate = new Map<string, ScriptData[]>();
  scripts.forEach((s) => {
    const date = new Date(s.createdAt).toDateString();
    if (!scriptsByDate.has(date)) scriptsByDate.set(date, []);
    scriptsByDate.get(date)!.push(s);
  });

  // Calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const today = new Date().toDateString();

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Stats
  const stats = {
    total: scripts.length,
    draft: scripts.filter((s) => s.status === "draft").length,
    filming: scripts.filter((s) => s.status === "filming").length,
    filmed: scripts.filter((s) => s.status === "filmed").length,
    published: scripts.filter((s) => s.status === "published").length,
  };

  function prevMonth() { setCurrentMonth(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentMonth(new Date(year, month + 1, 1)); }
  function goToday() { setCurrentMonth(new Date()); }

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/app" className="hover:text-foreground">Dashboard</Link>
        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
        <span>Calendar</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" /> Content Calendar
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Your content pipeline</h1>
          <p className="mt-1 text-muted-foreground">Track scripts from draft to published. Click any script to edit.</p>
        </div>
        <Button asChild className="brand-gradient text-white hover:opacity-90">
          <Link href="/app/scripts/new"><Plus className="mr-1.5 h-4 w-4" />New script</Link>
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = stats[key as keyof typeof stats] || 0;
          return (
            <div key={key} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                <span className="text-2xl font-bold font-display">{count}</span>
              </div>
              <div className="text-xs text-muted-foreground">{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Calendar controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="font-display text-xl font-bold">{monthName}</h2>
          <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button variant="ghost" size="sm" onClick={goToday}>Today</Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekdays.map((day) => (
            <div key={day} className="px-3 py-2 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-border last:border-r-0 bg-muted/30" />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day).toDateString();
            const dayScripts = scriptsByDate.get(date) || [];
            const isToday = date === today;
            return (
              <div
                key={day}
                className={cn(
                  "min-h-[100px] border-r border-b border-border last:border-r-0 p-2 flex flex-col gap-1",
                  isToday && "bg-brand/5"
                )}
              >
                <div className={cn(
                  "text-xs font-mono mb-1 inline-flex items-center justify-center w-6 h-6 rounded-full",
                  isToday ? "bg-brand text-white font-bold" : "text-muted-foreground"
                )}>
                  {day}
                </div>
                {dayScripts.slice(0, 3).map((s) => {
                  const cfg = statusConfig[s.status] || statusConfig.draft;
                  return (
                    <Link
                      key={s.id}
                      href={`/app/scripts/${s.id}`}
                      className="block text-xs px-2 py-1 rounded truncate hover:opacity-80 transition-opacity"
                      style={{ background: cfg.bg, color: cfg.color }}
                      title={s.title}
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: platformColors[s.platform] || "#64748b" }} />
                      {s.title.slice(0, 25)}
                    </Link>
                  );
                })}
                {dayScripts.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2">+{dayScripts.length - 3} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ background: cfg.bg, border: `1px solid ${cfg.color}` }} />
            {cfg.label}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Platform dots:</span>
          {Object.entries(platformColors).map(([p, c]) => (
            <span key={p} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: c }} />
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
