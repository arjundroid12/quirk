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

  console.log("[script page] id:", id, "session user:", user?.id, "email:", user?.email);

  if (!user?.id) {
    console.log("[script page] no session user, calling notFound()");
    notFound();
  }

  const script = await db.script.findUnique({ where: { id } });
  console.log("[script page] script found:", !!script, "script authorId:", script?.authorId);

  if (!script || script.authorId !== user.id) {
    console.log("[script page] script not found or authorId mismatch, calling notFound()");
    notFound();
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <ScriptEditor script={script as any} />
    </div>
  );
}
