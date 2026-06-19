"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type CVAnalysisRouteTab = "extraction" | "analysis";
export type CVAnalysisRouteMode = "list" | "new" | "detail";

export interface CVAnalysisRouteState {
  mode: CVAnalysisRouteMode;
  analysisId: string | null;
  tab: CVAnalysisRouteTab | null;
  pathname: string;
}

function normalizeTab(value: string | null): CVAnalysisRouteTab | null {
  if (value === "analysis") return "analysis";
  if (value === "extraction") return "extraction";
  return null;
}

function buildHref(
  mode: CVAnalysisRouteMode,
  analysisId: string | null,
  tab: CVAnalysisRouteTab | null,
) {
  if (mode === "new") return "/cv-analysis?mode=new";
  if (mode === "detail" && analysisId) {
    const query = tab ? `?tab=${tab}` : "";
    return `/cv-analysis/${analysisId}${query}`;
  }
  return "/cv-analysis";
}

export function useCVAnalysisRouteState(): CVAnalysisRouteState & {
  goToList: () => void;
  goToNew: () => void;
  goToDetail: (analysisId: string, tab?: CVAnalysisRouteTab | null) => void;
  replaceDetail: (analysisId: string, tab?: CVAnalysisRouteTab | null) => void;
  setTab: (tab: CVAnalysisRouteTab) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const parts = pathname.split("/").filter(Boolean);
  const analysisId =
    parts[0] === "cv-analysis" && parts[1] ? decodeURIComponent(parts[1]) : null;
  const mode = searchParams.get("mode") === "new"
    ? "new"
    : analysisId
      ? "detail"
      : "list";
  const tab = normalizeTab(searchParams.get("tab"));

  return {
    mode,
    analysisId,
    tab,
    pathname,
    goToList: () => router.push(buildHref("list", null, null)),
    goToNew: () => router.push(buildHref("new", null, null)),
    goToDetail: (nextAnalysisId, nextTab = null) =>
      router.push(buildHref("detail", nextAnalysisId, nextTab)),
    replaceDetail: (nextAnalysisId, nextTab = null) =>
      router.replace(buildHref("detail", nextAnalysisId, nextTab)),
    setTab: (nextTab) => {
      if (mode === "detail" && analysisId) {
        router.replace(buildHref("detail", analysisId, nextTab));
      }
    },
  };
}
