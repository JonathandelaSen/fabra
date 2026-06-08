"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { BasicPanel } from "@/components/shared/basic-panel";

export function InterviewQuestionsSkeleton() {
  const sidebarHeaderSkeleton = (
    <div className="space-y-2 animate-pulse">
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );

  const sidebarSkeleton = (
    <FeatureSidebarPanel header={sidebarHeaderSkeleton}>
      <div className="w-full animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="mb-2 w-full rounded-xl border border-transparent p-3.5">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-4 rounded-md" />
            </div>
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </FeatureSidebarPanel>
  );

  return (
    <FeatureScreenShell
      title={<Skeleton className="h-8 w-60 rounded-md animate-pulse" />}
    >
      <FeatureTwoPaneLayout sidebar={sidebarSkeleton}>
        <div className="flex w-full max-w-[1600px] mx-auto flex-col gap-5 animate-pulse">
          <BasicPanel as="section" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <Skeleton className="mb-2 h-3.5 w-24 rounded" />
              <Skeleton className="h-8 w-3/4 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </BasicPanel>

          <BasicPanel as="section" className="p-5 space-y-4">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>
            </div>
          </BasicPanel>

          <BasicPanel as="section" className="p-5 space-y-4">
            <Skeleton className="h-4 w-28 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-52 w-full rounded-lg" />
            </div>
          </BasicPanel>
        </div>
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}

export function InterviewQuestionsDetailSkeleton() {
  return (
    <div className="flex w-full max-w-[1600px] mx-auto flex-col gap-5 animate-pulse">
      <BasicPanel as="section" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <Skeleton className="mb-2 h-3.5 w-24 rounded" />
          <Skeleton className="h-8 w-3/4 rounded-md" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </BasicPanel>

      <BasicPanel as="section" className="p-5 space-y-4">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        </div>
      </BasicPanel>

      <BasicPanel as="section" className="p-5 space-y-4">
        <Skeleton className="h-4 w-28 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-52 w-full rounded-lg" />
        </div>
      </BasicPanel>
    </div>
  );
}
