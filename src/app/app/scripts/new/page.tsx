import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewScriptForm } from "@/components/script-studio/new-script-form";

export default function NewScriptPage() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/app/scripts" className="hover:text-foreground">
          Scripts
        </Link>
        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
        <span>New</span>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
          Script Studio
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          Generate a new script
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tell us your niche, platform, and tone. We'll write the hook, body, CTA, and hashtags — platform-native.
        </p>
      </div>

      <NewScriptForm />
    </div>
  );
}
