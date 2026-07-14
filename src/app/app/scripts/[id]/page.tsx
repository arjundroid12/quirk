import { notFound } from "next/navigation";
import { getToken } from "next-auth/jwt";
import { headers, cookies } from "next/headers";
import { db } from "@/lib/db";
import { ScriptEditor } from "@/components/script-studio/script-editor";

export const dynamic = "force-dynamic";

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Build a request-like object for getToken using next/headers
  // In Next.js 16, cookies() returns ReadonlyRequestCookies
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const req = {
    headers: {
      cookie: cookieHeader,
      ...Object.fromEntries(headerStore.entries()),
    },
  };

  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    notFound();
  }

  const script = await db.script.findUnique({ where: { id } });
  if (!script || script.authorId !== token.id) {
    notFound();
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <ScriptEditor script={script as any} />
    </div>
  );
}
