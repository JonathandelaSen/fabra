import { Skeleton } from "@/components/ui/skeleton";
import { BasicPanel } from "@/components/shared/basic-panel";

export function ObjectivesSidebarSkeleton() {
  return (
    <div className="space-y-5 py-1">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <section key={groupIndex}>
          <div className="mb-2.5 flex items-center justify-between px-2">
            <Skeleton className="h-3.5 w-24 bg-white/[0.04]" />
            <Skeleton className="h-4.5 w-7 rounded-full bg-white/[0.04]" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: groupIndex === 0 ? 3 : 2 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-4/5 bg-white/[0.04]" />
                    <Skeleton className="h-3 w-2/5 bg-white/[0.04]" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded-full bg-white/[0.04]" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Skeleton className="h-4.5 w-14 rounded-full bg-white/[0.04]" />
                  <Skeleton className="h-3 w-16 bg-white/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ObjectivesDetailSkeleton() {
  return (
    <div className="w-full space-y-6">
      <BasicPanel className="p-5 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5.5 w-16 rounded-full bg-white/[0.04]" />
              <Skeleton className="h-5.5 w-24 rounded-full bg-white/[0.04]" />
              <Skeleton className="h-5.5 w-20 rounded-full bg-white/[0.04]" />
            </div>
            <Skeleton className="h-8 w-3/4 bg-white/[0.04]" />
            <Skeleton className="h-4 w-4/5 bg-white/[0.04]" />
          </div>
          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-9 w-16 rounded-lg bg-white/[0.04]" />
            <Skeleton className="h-9 w-9 rounded-lg bg-white/[0.04]" />
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 bg-white/[0.04]" />
              <Skeleton className="h-3.5 w-16 bg-white/[0.04]" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-white/[0.04]" />
          </div>
          <div className="flex gap-4 shrink-0">
            <Skeleton className="h-4 w-24 bg-white/[0.04]" />
            <Skeleton className="h-4 w-28 bg-white/[0.04]" />
          </div>
        </div>
      </BasicPanel>

      <BasicPanel className="overflow-hidden">
        <div className="border-b border-white/[0.06] px-5 py-4 flex items-center justify-between bg-white/[0.01]">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 bg-white/[0.04]" />
            <Skeleton className="h-3 w-20 bg-white/[0.04]" />
          </div>
          <Skeleton className="h-2 w-32 rounded-full bg-white/[0.04]" />
        </div>
        <div className="p-5 space-y-2.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5 flex items-center gap-3"
            >
              <Skeleton className="h-5 w-5 rounded-full bg-white/[0.04]" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/5 bg-white/[0.04]" />
                <Skeleton className="h-3 w-1/4 bg-white/[0.04]" />
              </div>
              <Skeleton className="h-6 w-16 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </BasicPanel>
    </div>
  );
}
