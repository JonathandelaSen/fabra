"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

const basePath = "/objectives";

export function useObjectivesRouteState() {
  const router = useRouter();
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
      router.push(hrefFor(nextObjectiveId));
    },
    [hrefFor, router]
  );

  const replaceObjective = useCallback(
    (nextObjectiveId: string) => {
      router.replace(hrefFor(nextObjectiveId));
    },
    [hrefFor, router]
  );

  const clearObjective = useCallback(() => {
    router.replace(hrefFor(null));
  }, [hrefFor, router]);

  return {
    objectiveId,
    pathname,
    hrefFor,
    selectObjective,
    replaceObjective,
    clearObjective,
  };
}
