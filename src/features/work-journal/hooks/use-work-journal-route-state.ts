"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

export type WorkJournalRouteView = "list" | "timeline";

export function useWorkJournalRouteState() {
  const router = useRouter();
  const pathname = usePathname();

  // Parse:
  // /work-journal
  // /work-journal/timeline
  // /work-journal/timeline/[id]
  const segments = pathname.startsWith("/work-journal/")
    ? pathname.slice("/work-journal/".length).split("/").map(decodeURIComponent)
    : [];

  const view: WorkJournalRouteView =
    segments[0] === "timeline" ? "timeline" : "list";
  const timelineEntryId =
    view === "timeline" ? segments[1] || null : null;

  const goToList = useCallback(() => {
    router.push("/work-journal");
  }, [router]);

  const goToTimeline = useCallback(() => {
    router.push("/work-journal/timeline");
  }, [router]);

  const selectTimelineEntry = useCallback(
    (id: string) => {
      router.push(`/work-journal/timeline/${encodeURIComponent(id)}`);
    },
    [router],
  );

  const backToTimeline = useCallback(() => {
    router.push("/work-journal/timeline");
  }, [router]);

  return {
    view,
    timelineEntryId,
    pathname,
    goToList,
    goToTimeline,
    selectTimelineEntry,
    backToTimeline,
  };
}
