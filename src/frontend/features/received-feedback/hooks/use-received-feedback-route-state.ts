"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

export function useReceivedFeedbackRouteState() {
  const router = useRouter();
  const pathname = usePathname();
  const selectedId = pathname.startsWith("/received-feedback/")
    ? decodeURIComponent(pathname.slice("/received-feedback/".length).split("/")[0] ?? "") || null
    : null;

  const goToList = useCallback(() => {
    router.push("/received-feedback");
  }, [router]);

  const selectItem = useCallback(
    (id: string) => {
      router.push(`/received-feedback/${encodeURIComponent(id)}`);
    },
    [router],
  );

  const replaceItem = useCallback(
    (id: string) => {
      router.replace(`/received-feedback/${encodeURIComponent(id)}`);
    },
    [router],
  );

  return {
    pathname,
    selectedId,
    goToList,
    selectItem,
    replaceItem,
  };
}
