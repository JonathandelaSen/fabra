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
    <div className="space-y-3 px-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-20 w-full rounded-xl bg-white/[0.03]"
        />
      ))}
    </div>
  );
}


