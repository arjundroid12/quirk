import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ScriptEditor } from "@/components/script-studio/script-editor";

export default async function ScriptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const { id } = await params;

  const script = await db.script.findUnique({ where: { id } });
  if (!script || script.authorId !== user?.id) {
    notFound();
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <ScriptEditor script={script} />
    </div>
  );
}
