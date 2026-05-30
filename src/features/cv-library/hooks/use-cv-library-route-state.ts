"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const basePath = "/cvs";
export type CVLibraryTab = "library" | "templates" | "editor";

function normalizeTab(value: string | null): CVLibraryTab {
  return value === "templates" || value === "editor" ? value : "library";
}

export function useCVLibraryRouteState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cvId = pathname.startsWith(`${basePath}/`)
    ? decodeURIComponent(pathname.slice(`${basePath}/`.length).split("/")[0] ?? "") ||
      null
    : null;
  const tab = normalizeTab(searchParams.get("tab"));

  const hrefFor = useCallback(
    (nextCvId: string | null, nextTab: CVLibraryTab = tab) => {
      const query = new URLSearchParams();
      if (nextTab !== "library") query.set("tab", nextTab);
      const path = nextCvId ? `${basePath}/${encodeURIComponent(nextCvId)}` : basePath;
      const qs = query.toString();
      return qs ? `${path}?${qs}` : path;
    },
    [tab]
  );

  const selectCV = useCallback(
    (nextCvId: string) => {
      router.push(hrefFor(nextCvId));
    },
    [hrefFor, router]
  );

  const replaceCV = useCallback(
    (nextCvId: string | null) => {
      router.replace(hrefFor(nextCvId));
    },
    [hrefFor, router]
  );

  const setTab = useCallback(
    (nextTab: CVLibraryTab) => {
      router.push(hrefFor(cvId, nextTab));
    },
    [cvId, hrefFor, router]
  );

  return {
    pathname,
    cvId,
    tab,
    hrefFor,
    selectCV,
    replaceCV,
    setTab,
  };
}
