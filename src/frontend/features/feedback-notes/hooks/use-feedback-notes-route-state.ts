"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { FeedbackFilter } from "../api/feedback-notes-api";

function normalizeStatus(value: string | null): FeedbackFilter {
  return value === "closed" || value === "all" ? value : "active";
}

export function useFeedbackNotesRouteState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const status = normalizeStatus(searchParams.get("status"));
  const feedbackId = pathname.startsWith("/feedback-notes/")
    ? decodeURIComponent(pathname.slice("/feedback-notes/".length).split("/")[0] ?? "") || null
    : null;

  const hrefFor = useCallback((nextFeedbackId: string | null, nextStatus = status) => {
    const query = new URLSearchParams({ status: nextStatus });
    return nextFeedbackId
      ? `/feedback-notes/${encodeURIComponent(nextFeedbackId)}?${query.toString()}`
      : `/feedback-notes?${query.toString()}`;
  }, [status]);

  const setStatus = useCallback(
    (nextStatus: FeedbackFilter) => {
      router.push(hrefFor(feedbackId, nextStatus));
    },
    [feedbackId, hrefFor, router]
  );

  const selectFeedback = useCallback(
    (nextFeedbackId: string) => {
      router.push(hrefFor(nextFeedbackId));
    },
    [hrefFor, router]
  );

  const replaceFeedback = useCallback(
    (nextFeedbackId: string) => {
      router.replace(hrefFor(nextFeedbackId));
    },
    [hrefFor, router]
  );

  const clearSelection = useCallback(() => {
    router.replace(hrefFor(null));
  }, [hrefFor, router]);

  return {
    feedbackId,
    status,
    pathname,
    setStatus,
    selectFeedback,
    replaceFeedback,
    clearSelection,
  };
}
