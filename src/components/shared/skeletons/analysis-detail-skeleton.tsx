import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisDetailSkeletonProps {
  isJobMatch?: boolean;
}

export function AnalysisDetailSkeleton({ isJobMatch = false }: AnalysisDetailSkeletonProps) {
  return (
    <div className="w-full space-y-5">
      {/* Score card / ScoreHero skeleton */}
      <div className="rounded-2xl border border-line bg-panel-subtle p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Skeleton className="shrink-0 w-32 h-32 rounded-full" />
          <div className="flex-1 space-y-3 min-w-0 w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Skeleton className="h-6 w-28 rounded-md" />
              <Skeleton className="h-6 w-36 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Next Step banner skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-line bg-panel-subtle p-5">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Skeleton className="flex-shrink-0 w-10 h-10 rounded-xl" />
          <div className="min-w-0 space-y-1 flex-1">
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-5 w-1/2 mb-1.5" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        </div>
        <Skeleton className="flex-shrink-0 h-10 w-36 rounded-xl" />
      </div>

      {isJobMatch && (
        <div className="flex items-center gap-1">
          <Skeleton className="h-10 w-28 rounded-2xl" />
          <Skeleton className="h-10 w-24 rounded-2xl" />
          <Skeleton className="h-10 w-32 rounded-2xl" />
          <Skeleton className="h-10 w-20 rounded-2xl" />
          <Skeleton className="h-10 w-32 rounded-2xl" />
        </div>
      )}

      {/* Two columns: Improvements & Keywords */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Improvement areas */}
        <div className="space-y-4 rounded-2xl border border-line bg-panel-subtle p-6">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-5 w-40" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Keywords found */}
        <div className="space-y-4 rounded-2xl border border-line bg-panel-subtle p-6">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Context skeleton */}
      <div className="rounded-2xl border border-line bg-panel-subtle p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="rounded-lg border border-line bg-zinc-900/30 p-3">
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
