"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

export function usePublicCVMessagesRouteState() {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.slice("/public-cv-messages".length).split("/").filter(Boolean).map(decodeURIComponent);
  const cvId = segments[0] ?? null;
  const messageId = segments[1] ?? null;

  const hrefFor = useCallback((nextCVId: string | null, nextMessageId: string | null) => {
    if (!nextCVId) return "/public-cv-messages";
    return nextMessageId ? `/public-cv-messages/${encodeURIComponent(nextCVId)}/${encodeURIComponent(nextMessageId)}` : `/public-cv-messages/${encodeURIComponent(nextCVId)}`;
  }, []);

  const selectMessage = useCallback(
    (nextMessageId: string) => {
      router.push(hrefFor(cvId, nextMessageId));
    },
    [cvId, hrefFor, router]
  );

  const replaceMessage = useCallback(
    (nextMessageId: string) => {
      router.replace(hrefFor(cvId, nextMessageId));
    },
    [cvId, hrefFor, router]
  );

  const clearSelection = useCallback(() => {
    router.replace(hrefFor(cvId, null));
  }, [cvId, hrefFor, router]);

  const selectCV = useCallback((nextCVId: string) => router.push(hrefFor(nextCVId, null)), [hrefFor, router]);

  return {
    cvId,
    messageId,
    pathname,
    selectMessage,
    replaceMessage,
    clearSelection,
    selectCV,
  };
}
