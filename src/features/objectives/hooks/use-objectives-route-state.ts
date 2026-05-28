"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";

const basePath = "/objectives";

export function useObjectivesRouteState() {
  const pathname = usePathname();
  const objectiveId = pathname.startsWith(`${basePath}/`)
    ? decodeURIComponent(pathname.slice(`${basePath}/`.length).split("/")[0] ?? "") ||
      null
    : null;

  const hrefFor = useCallback(
    (nextObjectiveId: string | null) => {
      return nextObjectiveId
        ? `${basePath}/${encodeURIComponent(nextObjectiveId)}`
        : `${basePath}`;
    },
    []
  );

  const selectObjective = useCallback(
    (nextObjectiveId: string) => {
      window.history.pushState(null, "", hrefFor(nextObjectiveId));
    },
    [hrefFor]
  );

  const replaceObjective = useCallback(
    (nextObjectiveId: string) => {
      window.history.replaceState(null, "", hrefFor(nextObjectiveId));
    },
    [hrefFor]
  );

  const clearObjective = useCallback(() => {
    window.history.replaceState(null, "", hrefFor(null));
  }, [hrefFor]);

  return {
    objectiveId,
    pathname,
    hrefFor,
    selectObjective,
    replaceObjective,
    clearObjective,
  };
}
