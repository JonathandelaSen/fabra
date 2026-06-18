"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function JobMatchAnalysisDetailSkeleton() {
  return (
    <div className="w-full space-y-5">
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

      <div className="sticky top-[-16px] sm:top-[-24px] z-20 -mx-4 sm:-mx-6 mb-4 px-2 sm:px-6 py-2 backdrop-blur-md">
        <div className="flex gap-1 rounded-2xl border border-line bg-panel/[0.03] p-1 w-fit max-w-full overflow-x-auto justify-start flex-nowrap [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        <div className="space-y-4 rounded-2xl border border-line bg-panel-subtle p-6">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-8" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-line bg-panel-subtle p-6">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-panel-subtle p-6">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
