import { notFound } from "next/navigation";
import { getToken } from "next-auth/jwt";
import { headers, cookies } from "next/headers";
import { db } from "@/lib/db";
import { ScriptEditor } from "@/components/script-studio/script-editor";

export const dynamic = "force-dynamic";

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Next.js 16: cookies() and headers() are async
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  // Build the cookie header string that getToken expects
  const allCookies = cookieStore.getAll();
  const cookieStr = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

  // getToken needs req.headers.cookie (string format)
  const token = await getToken({
    req: { headers: { cookie: cookieStr } } as any,
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
