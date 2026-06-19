"use client";

import { Skeleton } from "@/frontend/components/ui/skeleton";

export function JobAnalysesListSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex w-full items-start gap-3 rounded-xl border border-transparent p-3.5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-10 shrink-0 rounded-md" />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
