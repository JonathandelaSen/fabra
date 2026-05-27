"use client";

import { usePathname, useSearchParams } from "next/navigation";

export type CVAnalysisRouteTab = "extraction" | "analysis";
export type CVAnalysisRouteMode = "list" | "new" | "detail";

export interface CVAnalysisRouteState {
  mode: CVAnalysisRouteMode;
  analysisId: string | null;
  tab: CVAnalysisRouteTab;
}

function normalizeTab(value: string | null): CVAnalysisRouteTab {
  return value === "analysis" ? "analysis" : "extraction";
}

function buildHref(
  mode: CVAnalysisRouteMode,
  analysisId: string | null,
  tab: CVAnalysisRouteTab,
) {
  if (mode === "new") return "/cv-analysis?mode=new";
  if (mode === "detail" && analysisId) {
    const query = tab === "analysis" ? "?tab=analysis" : "";
    return `/cv-analysis/${analysisId}${query}`;
  }
  return "/cv-analysis";
}

export function useCVAnalysisRouteState(): CVAnalysisRouteState & {
  goToList: () => void;
  goToNew: () => void;
  goToDetail: (analysisId: string, tab?: CVAnalysisRouteTab) => void;
  replaceDetail: (analysisId: string, tab?: CVAnalysisRouteTab) => void;
  setTab: (tab: CVAnalysisRouteTab) => void;
} {
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

  const replace = (href: string) => window.history.replaceState(null, "", href);
  const push = (href: string) => window.history.pushState(null, "", href);

  return {
    mode,
    analysisId,
    tab,
    goToList: () => push(buildHref("list", null, "extraction")),
    goToNew: () => push(buildHref("new", null, "extraction")),
    goToDetail: (nextAnalysisId, nextTab = "extraction") =>
      push(buildHref("detail", nextAnalysisId, nextTab)),
    replaceDetail: (nextAnalysisId, nextTab = "extraction") =>
      replace(buildHref("detail", nextAnalysisId, nextTab)),
    setTab: (nextTab) => {
      if (mode === "detail" && analysisId) {
        replace(buildHref("detail", analysisId, nextTab));
      }
    },
  };
}
