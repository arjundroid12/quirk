import { Skeleton } from "@/components/ui/skeleton";

export default function ScriptsLoading() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex justify-end mb-6">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
