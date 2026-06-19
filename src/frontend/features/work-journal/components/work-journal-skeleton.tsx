import { Skeleton } from "@/frontend/components/ui/skeleton";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";

export function WorkJournalSkeleton() {
  return (
    <div className="pb-4 w-full lg:pt-0 lg:pb-8">
      <div className="flex items-center justify-between mb-6 w-full gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-28 bg-panel/5" />
          <Skeleton className="h-4 w-20 bg-panel/5" />
          <Skeleton className="h-4 w-24 bg-panel/5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 bg-panel/5 rounded-md" />
          <Skeleton className="h-8 w-16 bg-panel/5 rounded-md" />
        </div>
      </div>

      <BasicPanel className="w-full p-6 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-full bg-panel/5" />
          <Skeleton className="h-5 w-[90%] bg-panel/5" />
          <Skeleton className="h-5 w-[75%] bg-panel/5" />
          <Skeleton className="h-5 w-[85%] bg-panel/5" />
        </div>
      </BasicPanel>
    </div>
  );
}

export function WorkJournalSidebarSkeleton() {
  return (
    <div className="w-full">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="mb-2 w-full rounded-xl border border-transparent p-3.5">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-4/5 bg-panel/[0.03]" />
            <Skeleton className="h-4 w-4 rounded-md bg-panel/[0.03]" />
          </div>
          <Skeleton className="mt-1.5 h-3 w-3/4 bg-panel/[0.03]" />
          <div className="mt-3 flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-24 rounded bg-panel/[0.03]" />
            <Skeleton className="h-3 w-16 bg-panel/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  );
}

