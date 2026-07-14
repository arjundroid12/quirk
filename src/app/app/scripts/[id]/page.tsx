"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ScriptEditor } from "@/components/script-studio/script-editor";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [script, setScript] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptId, setScriptId] = useState<string>("");
  const searchParams = useSearchParams();
  const autoHumanize = searchParams.get("humanize") === "1";

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setScriptId(id);
      try {
        const res = await fetch(`/api/scripts/${id}`);
        if (!res.ok) {
          if (res.status === 401) setError("Please sign in to view this script");
          else if (res.status === 404) setError("Script not found");
          else setError("Failed to load script");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.ok) {
          setScript(data.script);
        } else {
          setError(data.error || "Failed to load script");
        }
      } catch (err: any) {
        setError(err?.message || "Network error");
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-20 max-w-5xl mx-auto flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-20 max-w-5xl mx-auto text-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!script) return null;

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <ScriptEditor script={script} autoHumanize={autoHumanize} />
    </div>
  );
}
