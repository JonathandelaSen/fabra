import { Skeleton } from "@/components/ui/skeleton";

interface SidebarListSkeletonProps {
  itemCount?: number;
}

export function SidebarListSkeleton({ itemCount = 5 }: SidebarListSkeletonProps) {
  return (
    <div className="w-full">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="mb-2 w-full rounded-xl border border-transparent p-3.5">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-4 rounded-md" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
