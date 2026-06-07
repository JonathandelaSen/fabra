import { Skeleton } from "@/components/ui/skeleton";
import { BasicPanel } from "@/components/shared/basic-panel";

export function ReceivedFeedbackListSkeleton() {
  return (
    <div className="w-full">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="mb-2 w-full rounded-xl border border-transparent p-3.5"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="mt-1.5 h-3 w-4/5" />
          <div className="mt-3 flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReceivedFeedbackDetailSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5">
      <BasicPanel as="section" className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between border-b border-line pb-5">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          <div className="rounded-xl border border-line bg-panel-subtle p-6 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="rounded-xl border border-warning-border bg-warning-soft p-5 space-y-2">
            <Skeleton className="h-3.5 w-24 bg-warning-soft" />
            <Skeleton className="h-4 w-full bg-warning-soft" />
            <Skeleton className="h-4 w-2/3 bg-warning-soft" />
          </div>
        </div>
      </BasicPanel>
    </div>
  );
}
