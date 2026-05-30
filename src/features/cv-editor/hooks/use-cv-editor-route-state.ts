"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

const basePath = "/cvs/editor";

export function useCVEditorRouteState() {
  const router = useRouter();
  const pathname = usePathname();
  const versionId = pathname.startsWith(`${basePath}/`)
    ? decodeURIComponent(pathname.slice(`${basePath}/`.length).split("/")[0] ?? "") ||
      null
    : null;

  const hrefFor = useCallback((nextVersionId: string | null) => {
    return nextVersionId
      ? `${basePath}/${encodeURIComponent(nextVersionId)}`
      : basePath;
  }, []);

  const selectVersion = useCallback(
    (nextVersionId: string) => {
      router.push(hrefFor(nextVersionId));
    },
    [hrefFor, router],
  );

  const replaceVersion = useCallback(
    (nextVersionId: string) => {
      router.replace(hrefFor(nextVersionId));
    },
    [hrefFor, router],
  );

  const clearVersion = useCallback(() => {
    router.replace(hrefFor(null));
  }, [hrefFor, router]);

  return {
    pathname,
    versionId,
    hrefFor,
    selectVersion,
    replaceVersion,
    clearVersion,
  };
}
