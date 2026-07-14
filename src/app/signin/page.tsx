import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { SignInCard } from "@/components/landing/signin-card";
import Link from "next/link";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; check?: string }>;
}) {
  const session = await getServerSession(authOptions);
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
      <main className="flex-1 grid lg:grid-cols-2">
        {/* Left: Sign-in form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <SignInCard next={next} />
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="hidden lg:flex items-center justify-center bg-brand/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative max-w-md p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/art-tech.avif"
              alt="Creator using QUIRK"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
            <p className="mt-6 text-center text-sm text-muted-foreground italic">
              "8 AI tools. One workspace. From idea to script in 60 seconds."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
