import { BasicPanel } from "@/components/shared/basic-panel";
import { SidebarListSkeleton } from "@/components/shared/skeletons/sidebar-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function PerformanceReviewSidebarSkeleton() {
  return <SidebarListSkeleton itemCount={4} />;
}

export function PerformanceReviewDetailSkeleton() {
  return (
    <div className="w-full space-y-5">
      <BasicPanel className="space-y-4 p-5">
        <Skeleton className="h-8 w-2/3" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-44" />
        </div>
      </BasicPanel>
      <Skeleton className="h-10 w-80 rounded-xl" />
      <div className="grid gap-5 xl:grid-cols-2">
        <BasicPanel className="space-y-4 p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </BasicPanel>
        <BasicPanel className="space-y-4 p-5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </BasicPanel>
      </div>
    </div>
  );
}
