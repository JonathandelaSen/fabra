import { Skeleton } from "@/frontend/components/ui/skeleton";
import { SidebarListSkeleton } from "@/frontend/components/shared/skeletons/sidebar-list-skeleton";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";

export function FeedbackNotesListSkeleton() {
  return <SidebarListSkeleton itemCount={7} />;
}

export function FeedbackNotesDetailSkeleton() {
  return (
    <div className="flex w-full max-w-[1600px] mx-auto flex-col gap-5 animate-pulse">
      <BasicPanel as="section" className="p-3 sm:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-8 w-1/3 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </BasicPanel>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,440px)]">
        <div className="min-w-0 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <BasicPanel key={index} className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </BasicPanel>
          ))}
        </div>
        <section className="relative min-w-0 rounded-lg border border-action-border/15 bg-[image:var(--ui-feedback-panel-bg)] shadow-[var(--ui-action-glow-shadow)] p-4 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-2 w-48" />
          <Skeleton className="h-[18rem] w-full rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </section>
      </section>
    </div>
  );
}
