"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

const basePath = "/reviews";

export function usePerformanceReviewRouteState() {
  const router = useRouter();
  const pathname = usePathname();
  const isReviewsRoute =
    pathname === basePath || pathname.startsWith(`${basePath}/`);
  const segments = isReviewsRoute
    ? pathname.slice(basePath.length).split("/").filter(Boolean)
    : [];
  const isCreating = segments[0] === "new";
  const reviewId = !isCreating && segments[0] ? decodeURIComponent(segments[0]) : null;
  const isEditing = Boolean(reviewId && segments[1] === "edit");

  const goToList = useCallback(() => router.push(basePath), [router]);
  const startCreate = useCallback(() => router.push(`${basePath}/new`), [router]);
  const selectReview = useCallback(
    (id: string) => router.push(`${basePath}/${encodeURIComponent(id)}`),
    [router],
  );
  const editReview = useCallback(
    (id: string) => router.push(`${basePath}/${encodeURIComponent(id)}/edit`),
    [router],
  );

  return {
    pathname,
    reviewId,
    isCreating,
    isEditing,
    goToList,
    startCreate,
    selectReview,
    editReview,
  };
}
