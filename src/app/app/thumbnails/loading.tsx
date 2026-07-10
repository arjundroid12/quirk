import { Skeleton } from "@/components/ui/skeleton";

export default function ThumbnailsLoading() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-3 w-32 mb-3" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Upload card skeleton */}
      <div className="rounded-3xl border border-border bg-card p-8 mb-10">
        <Skeleton className="h-9 w-9 rounded-xl mb-6" />
        <Skeleton className="h-40 w-full rounded-2xl mb-4" />
        <Skeleton className="h-12 w-56 rounded-lg" />
      </div>

      {/* Past batches skeleton */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2].map((j) => (
                  <Skeleton key={j} className="h-12 w-20 rounded-md border-2 border-background" />
                ))}
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
