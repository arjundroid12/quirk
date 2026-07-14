import { ToolsHub } from "@/components/tools/tools-hub";

export const dynamic = "force-dynamic";

export default function ToolsPage() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      {/* Decorative illustration banner */}
      <div className="mb-8 relative rounded-3xl overflow-hidden border border-border/60 h-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art-tech.avif" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand/60 via-brand-pink/30 to-transparent" />
        <div className="relative h-full flex items-center px-8">
          <p className="text-white font-display text-lg font-bold drop-shadow-lg">4 standalone AI tools. Pick one to start.</p>
        </div>
      </div>
      <ToolsHub />
    </div>
  );
}
