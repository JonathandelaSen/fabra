import { Skeleton } from "@/components/ui/skeleton";

export function ReceivedFeedbackListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-white/5 bg-white/[0.01] p-3.5 space-y-2.5"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-4/5" />
          <div className="flex justify-between items-center pt-2">
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
      <section className="rounded-xl border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between border-b border-white/[0.04] pb-5">
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
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-5 space-y-2">
            <Skeleton className="h-3.5 w-24 bg-amber-400/10" />
            <Skeleton className="h-4 w-full bg-amber-300/10" />
            <Skeleton className="h-4 w-2/3 bg-amber-300/10" />
          </div>
        </div>
      </section>
    </div>
  );
}
