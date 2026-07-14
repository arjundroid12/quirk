import { notFound } from "next/navigation";
import { getToken } from "next-auth/jwt";
import { headers, cookies } from "next/headers";
import { db } from "@/lib/db";
import { ScriptEditor } from "@/components/script-studio/script-editor";

export const dynamic = "force-dynamic";

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Debug info
  const debug: any = { id, step: "start" };

  try {
    debug.step = "reading cookies";
    const cookieStore = cookies().getAll();
    debug.cookieNames = cookieStore.map((c) => c.name);

    debug.step = "building req object";
    const req = {
      headers: Object.fromEntries(headers().entries()),
      cookies: Object.fromEntries(cookieStore.map((c) => [c.name, c.value])),
    };

    debug.step = "calling getToken";
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    debug.step = "token result";
    debug.tokenExists = !!token;
    debug.tokenId = token?.id;
    debug.tokenEmail = token?.email;
    debug.hasSecret = !!process.env.NEXTAUTH_SECRET;

    if (!token?.id) {
      return (
        <div className="px-6 py-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug: No token</h1>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto whitespace-pre-wrap">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      );
    }

    debug.step = "querying script";
    const script = await db.script.findUnique({ where: { id } });
    debug.scriptFound = !!script;
    debug.scriptAuthorId = script?.authorId;

    if (!script || script.authorId !== token.id) {
      debug.authorMatch = script ? script.authorId === token.id : false;
      return (
        <div className="px-6 py-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug: Script not accessible</h1>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto whitespace-pre-wrap">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        <ScriptEditor script={script as any} />
      </div>
    );
  } catch (err: any) {
    debug.step = "ERROR";
    debug.error = err?.message || String(err);
    debug.stack = err?.stack?.split('\n').slice(0, 5);
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug: Error</h1>
        <pre className="text-xs bg-muted p-4 rounded overflow-auto whitespace-pre-wrap">
          {JSON.stringify(debug, null, 2)}
        </pre>
      </div>
    );
  }
}
