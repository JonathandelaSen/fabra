"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

export type WorkJournalRouteView = "list" | "timeline";

export function useWorkJournalRouteState() {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.startsWith("/work-journal/")
    ? pathname.slice("/work-journal/".length).split("/").map(decodeURIComponent)
    : [];

  const view: WorkJournalRouteView =
    segments[0] === "timeline" ? "timeline" : "list";
  const timelineEntryId =
    view === "timeline" ? segments[1] || null : null;
  const listEntryId =
    view === "list" ? segments[0] || null : null;

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

  const selectListEntry = useCallback(
    (id: string) => {
      router.push(`/work-journal/${encodeURIComponent(id)}`);
    },
    [router],
  );

  const replaceListEntry = useCallback(
    (id: string) => {
      router.replace(`/work-journal/${encodeURIComponent(id)}`);
    },
    [router],
  );

  const backToTimeline = useCallback(() => {
    router.push("/work-journal/timeline");
  }, [router]);

  return {
    view,
    listEntryId,
    timelineEntryId,
    pathname,
    goToList,
    goToTimeline,
    selectListEntry,
    replaceListEntry,
    selectTimelineEntry,
    backToTimeline,
  };
}
