import { Skeleton } from "@/components/ui/skeleton";

export default function IdeasLoading() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Generator form skeleton */}
      <div className="rounded-3xl border border-border bg-card p-8 mb-10">
        <Skeleton className="h-9 w-9 rounded-xl mb-6" />
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-md mb-6" />
        <Skeleton className="h-4 w-20 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-48 rounded-lg" />
      </div>

      {/* Bank skeleton */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-16 w-full rounded-lg mb-3" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
