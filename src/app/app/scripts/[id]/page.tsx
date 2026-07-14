import { notFound } from "next/navigation";
import { getToken } from "next-auth/jwt";
import { headers, cookies } from "next/headers";
import { db } from "@/lib/db";
import { ScriptEditor } from "@/components/script-studio/script-editor";

export const dynamic = "force-dynamic";

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // In Next.js 16 App Router, getServerSession doesn't work reliably.
  // Use getToken with the actual request headers + cookies.
  const req = {
    headers: Object.fromEntries(headers().entries()),
    cookies: Object.fromEntries(
      cookies().getAll().map((c) => [c.name, c.value])
    ),
  };

  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const userId = token?.id as string | undefined;
  const userEmail = token?.email as string | undefined;

  if (!userId) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug: No token</h1>
        <pre className="text-xs bg-muted p-4 rounded overflow-auto">
          {JSON.stringify({
            id,
            token: token ? "exists" : "null",
            tokenKeys: token ? Object.keys(token) : [],
            hasSecret: !!process.env.NEXTAUTH_SECRET,
            cookieNames: cookies().getAll().map((c) => c.name),
          }, null, 2)}
        </pre>
      </div>
    );
  }

  let script: any = null;
  let dbError: string | null = null;

  try {
    script = await db.script.findUnique({ where: { id } });
  } catch (err: any) {
    dbError = err?.message || String(err);
  }

  if (!script || script.authorId !== userId) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug: Script not accessible</h1>
        <pre className="text-xs bg-muted p-4 rounded overflow-auto">
          {JSON.stringify({
            id,
            userId,
            userEmail,
            scriptFound: !!script,
            scriptAuthorId: script?.authorId ?? null,
            authorMatch: script ? script.authorId === userId : false,
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
