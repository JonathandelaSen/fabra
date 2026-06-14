import { Skeleton } from "@/components/ui/skeleton";

export function CVAnalysesListSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex w-full items-start gap-3 rounded-xl border border-transparent p-3.5"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <div className="mt-2 flex items-center gap-3">
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
