import { ToolsHub } from "@/components/tools/tools-hub";

export const dynamic = "force-dynamic";

export default function ToolsPage() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <ToolsHub />
    </div>
  );
}
