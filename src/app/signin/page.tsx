import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-edge";
import { Logo } from "@/components/logo";
import { SignInCard } from "@/components/landing/signin-card";
import Link from "next/link";

export const runtime = "edge";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; check?: string }>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const next = sp.next ?? "/app";

  if (session) {
    redirect(next);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size={32} />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <SignInCard next={next} />
        </div>
      </main>
    </div>
  );
}
