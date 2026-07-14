import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ScriptEditor } from "@/components/script-studio/script-editor";

export const dynamic = "force-dynamic";

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const { id } = await params;

  // Debug: render diagnostics instead of silent 404
  let script: any = null;
  let dbError: string | null = null;

  try {
    script = await db.script.findUnique({ where: { id } });
  } catch (err: any) {
    dbError = err?.message || String(err);
  }

  // If not authenticated, show debug info
  if (!user?.id) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug: No session</h1>
        <pre className="text-xs bg-muted p-4 rounded overflow-auto">
          {JSON.stringify({ id, session: session ? "exists" : "null", user: user ? "exists" : "null", dbError }, null, 2)}
        </pre>
      </div>
    );
  }

  // If script not found or doesn't belong to user, show debug info
  if (!script || script.authorId !== user.id) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug: Script not accessible</h1>
        <pre className="text-xs bg-muted p-4 rounded overflow-auto">
          {JSON.stringify({
            id,
            userId: user.id,
            userEmail: user.email,
            scriptFound: !!script,
            scriptAuthorId: script?.authorId ?? null,
            authorMatch: script ? script.authorId === user.id : false,
            dbError,
          }, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <ScriptEditor script={script as any} />
    </div>
  );
}
