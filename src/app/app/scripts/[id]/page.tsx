import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth-edge";
import { queryOne } from "@/lib/db";
import { ScriptEditor } from "@/components/script-studio/script-editor";

export const runtime = "edge";

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const script = await queryOne<any>("SELECT * FROM Script WHERE id = ?", [id]);
  if (!script || script.authorId !== session?.user?.id) {
    notFound();
  }
  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <ScriptEditor script={script} />
    </div>
  );
}
