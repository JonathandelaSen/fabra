import { Skeleton } from "@/components/ui/skeleton";
import { SidebarListSkeleton } from "@/components/shared/skeletons/sidebar-list-skeleton";
import { BasicPanel } from "@/components/shared/basic-panel";

export function PublicCVMessagesListSkeleton() {
  return <SidebarListSkeleton itemCount={5} />;
}

export function PublicCVMessagesDetailSkeleton() {
  return (
    <BasicPanel className="h-full p-6 animate-pulse">
      <div className="flex h-full w-full flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3.5 w-1/5" />
          </div>
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
        <div className="flex-1 py-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </BasicPanel>
  );
}
