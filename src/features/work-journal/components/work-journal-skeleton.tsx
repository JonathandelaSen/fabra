import { Skeleton } from "@/components/ui/skeleton";
import { BasicPanel } from "@/components/shared/basic-panel";

export function WorkJournalSkeleton() {
  return (
    <div className="py-4 lg:py-8 w-full px-4 md:px-8">
      <BasicPanel className="w-full p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-3.5 w-28 bg-white/5" />
          <Skeleton className="h-3.5 w-20 bg-white/5" />
          <Skeleton className="h-3.5 w-24 bg-white/5" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-full bg-white/5" />
          <Skeleton className="h-5 w-[90%] bg-white/5" />
          <Skeleton className="h-5 w-[75%] bg-white/5" />
          <Skeleton className="h-5 w-[85%] bg-white/5" />
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
            <Skeleton className="h-4 w-4/5 bg-white/[0.03]" />
            <Skeleton className="h-4 w-4 rounded-md bg-white/[0.03]" />
          </div>
          <Skeleton className="mt-1.5 h-3 w-3/4 bg-white/[0.03]" />
          <div className="mt-3 flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-24 rounded bg-white/[0.03]" />
            <Skeleton className="h-3 w-16 bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  );
}

