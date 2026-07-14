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
        {/* Right: Illustration background */}
        <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art-summer.avif" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand/40 to-brand-pink/30" />
          <div className="relative max-w-md p-12 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art-tech.avif" alt="Creator using QUIRK" className="w-full h-auto rounded-2xl shadow-2xl" />
            <p className="mt-6 text-center text-sm text-white/90 italic font-medium">
              "8 AI tools. One workspace. From idea to script in 60 seconds."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
