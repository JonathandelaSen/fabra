"use client";

import { BasicPanel } from "@/components/shared/basic-panel";
import { Skeleton } from "@/components/ui/skeleton";

export function CVTemplatesSkeleton() {
  return (
    <div className="grid h-full w-full gap-6 lg:grid-cols-[800px_1fr]">
      <BasicPanel className="space-y-3 p-4">
        <div className="mb-4">
          <Skeleton className="h-6 w-32 rounded-md" />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-line/[0.04] bg-panel/[0.01] p-4"
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </BasicPanel>
      <BasicPanel className="grid gap-8 p-6 xl:grid-cols-2">
        <Skeleton className="aspect-[794/1123] w-full rounded-xl" />
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-44 rounded-lg" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </BasicPanel>
    </div>
  );
}
