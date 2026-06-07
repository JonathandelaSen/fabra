"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type AnalysisTab = "summary" | "offer" | "questions" | "chat" | "tracking";
export type JobMatchAnalysisRouteView = "list" | "kanban";
export type JobMatchAnalysisRouteMode = "list" | "detail" | "new";

const VALID_TABS: AnalysisTab[] = ["summary", "offer", "questions", "chat", "tracking"];

function normalizeTab(value: string | null): AnalysisTab {
  return VALID_TABS.includes(value as AnalysisTab)
    ? (value as AnalysisTab)
    : "summary";
}

export interface ParsedJobMatchAnalysisRoute {
  mode: JobMatchAnalysisRouteMode;
  view: JobMatchAnalysisRouteView;
  analysisId: string | null;
  isAnalysisView: boolean;
}

export function shouldShowJobMatchAnalysisView({
  hasScore,
  isAnalysisView,
  isExplicitExtractionView,
}: {
  hasScore: boolean;
  isAnalysisView: boolean;
  isExplicitExtractionView: boolean;
}) {
  return isAnalysisView || (hasScore && !isExplicitExtractionView);
}

export function parseJobMatchAnalysisRoute(pathname: string): ParsedJobMatchAnalysisRoute {
  const segments = pathname.startsWith("/job-analyses/")
    ? pathname.slice("/job-analyses/".length).split("/").map(decodeURIComponent)
    : [];
  const view: JobMatchAnalysisRouteView =
    segments[0] === "kanban" ? "kanban" : "list";

  if (view === "list" && segments[0] === "new") {
    return {
      mode: "new",
      view,
      analysisId: null,
      isAnalysisView: false,
    };
  }

  const analysisId =
    view === "kanban" ? segments[1] || null : segments[0] || null;
  const isAnalysisView =
    view === "kanban" ? segments[2] === "analysis" : segments[1] === "analysis";

  return {
    mode: analysisId ? "detail" : "list",
    view,
    analysisId,
    isAnalysisView,
  };
}

export function getJobMatchAnalysisHref({
  id,
  analysis = false,
  extraction = false,
  tab = "summary",
  view = "list",
  mode,
}: {
  id?: string | null;
  analysis?: boolean;
  extraction?: boolean;
  tab?: AnalysisTab;
  view?: JobMatchAnalysisRouteView;
  mode?: JobMatchAnalysisRouteMode;
}) {
  if (mode === "new") return "/job-analyses/new";
  const base = view === "kanban" ? "/job-analyses/kanban" : "/job-analyses";
  if (!id) return base;
  const encodedId = encodeURIComponent(id);
  if (!analysis) {
    return `${base}/${encodedId}${extraction ? "?view=extraction" : ""}`;
  }
  if (tab === "summary") return `${base}/${encodedId}/analysis`;
  return `${base}/${encodedId}/analysis?tab=${tab}`;
}

export function useJobMatchAnalysisRouteState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { mode, view, analysisId, isAnalysisView } =
    parseJobMatchAnalysisRoute(pathname);
  const analysisTab = normalizeTab(searchParams.get("tab"));
  const isExplicitExtractionView = searchParams.get("view") === "extraction";

  const hrefFor = useCallback(
    (
      nextId: string | null,
      analysis = false,
      tab: AnalysisTab = "summary",
      nextView: JobMatchAnalysisRouteView = view,
    ) => {
      return getJobMatchAnalysisHref({
        id: nextId,
        analysis,
        tab,
        view: nextView,
      });
    },
    [view],
  );

  const selectAnalysis = useCallback(
    (id: string, analysis = false) => {
      router.push(hrefFor(id, analysis));
    },
    [hrefFor, router],
  );

  const replaceAnalysis = useCallback(
    (id: string, analysis = false) => {
      router.replace(hrefFor(id, analysis));
    },
    [hrefFor, router],
  );

  const clearSelection = useCallback(() => {
    router.replace(hrefFor(null));
  }, [hrefFor, router]);

  const goToBoard = useCallback(() => {
    router.push("/job-analyses/kanban");
  }, [router]);

  const goToNew = useCallback(() => {
    router.push(getJobMatchAnalysisHref({ mode: "new" }));
  }, [router]);

  const goToListView = useCallback(() => {
    router.push(hrefFor(analysisId, isAnalysisView, analysisTab, "list"));
  }, [analysisId, analysisTab, hrefFor, isAnalysisView, router]);

  const goToKanbanView = useCallback(() => {
    router.push(hrefFor(analysisId, isAnalysisView, analysisTab, "kanban"));
  }, [analysisId, analysisTab, hrefFor, isAnalysisView, router]);

  const goToAnalysis = useCallback(
    (tab: AnalysisTab = "summary") => {
      if (!analysisId) return;
      router.push(hrefFor(analysisId, true, tab));
    },
    [hrefFor, analysisId, router],
  );

  const goToAnalysisById = useCallback(
    (id: string, tab: AnalysisTab = "summary") => {
      router.push(hrefFor(id, true, tab));
    },
    [hrefFor, router],
  );

  const goToExtraction = useCallback(() => {
    if (!analysisId) return;
    router.push(
      getJobMatchAnalysisHref({
        id: analysisId,
        extraction: true,
        view,
      }),
    );
  }, [analysisId, router, view]);

  const setAnalysisTab = useCallback(
    (tab: AnalysisTab) => {
      if (!analysisId) return;
      router.push(hrefFor(analysisId, true, tab));
    },
    [hrefFor, analysisId, router],
  );

  return {
    mode,
    view,
    analysisId,
    isAnalysisView,
    isExplicitExtractionView,
    analysisTab,
    pathname,
    hrefFor,
    selectAnalysis,
    replaceAnalysis,
    clearSelection,
    goToNew,
    goToBoard,
    goToListView,
    goToKanbanView,
    goToAnalysis,
    goToAnalysisById,
    goToExtraction,
    setAnalysisTab,
  };
}
