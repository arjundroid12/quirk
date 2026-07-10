import Link from "next/link";
import { getSession } from "@/lib/auth-edge";
import { query } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, PenLine, ChevronLeft } from "lucide-react";
import { ScriptList } from "@/components/app/script-list";

export const runtime = "edge";

export default async function ScriptsListPage() {
  const session = await getSession();
  const scripts = await query("SELECT * FROM Script WHERE authorId = ? ORDER BY createdAt DESC LIMIT 100", [session?.user?.id || ""]);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/app" className="hover:text-foreground">Dashboard</Link>
        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
        <span>Scripts</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Script Studio</h1>
          <p className="mt-1 text-muted-foreground">All your AI-generated scripts in one place.</p>
        </div>
        <Button asChild className="brand-gradient text-white hover:opacity-90"><Link href="/app/scripts/new"><Plus className="mr-1.5 h-4 w-4" />New script</Link></Button>
      </div>
      {scripts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl brand-gradient items-center justify-center text-white mb-4"><PenLine className="h-6 w-6" /></div>
          <h3 className="font-display text-lg font-bold">No scripts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">Generate your first script — it takes about 3 seconds and is yours to keep.</p>
          <Button asChild className="mt-5 brand-gradient text-white"><Link href="/app/scripts/new"><Plus className="mr-1.5 h-4 w-4" />Create your first script</Link></Button>
        </div>
      ) : (
        <ScriptList scripts={scripts as any} />
      )}
    </div>
  );
}
