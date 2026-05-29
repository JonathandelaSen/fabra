"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { BasicPanel } from "@/components/shared/basic-panel";

export function CVLibrarySkeleton() {
  return (
    <div className="grid h-full w-full gap-6 p-6 md:p-8 lg:grid-cols-[360px_1fr]">
      <BasicPanel className="space-y-3 p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-white/[0.04] bg-white/[0.01] p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-4 rounded-md" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </BasicPanel>
      <BasicPanel className="flex w-full flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 border-b border-white/[0.04] pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-2/3" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </BasicPanel>
    </div>
  );
}
