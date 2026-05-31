"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type AnalysisTab = "summary" | "offer" | "questions" | "chat" | "tracking";
export type JobMatchAnalysisRouteView = "list" | "kanban";

const VALID_TABS: AnalysisTab[] = ["summary", "offer", "questions", "chat", "tracking"];

function normalizeTab(value: string | null): AnalysisTab {
  return VALID_TABS.includes(value as AnalysisTab)
    ? (value as AnalysisTab)
    : "summary";
}

export function useJobMatchAnalysisRouteState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse:
  // /job-analyses
  // /job-analyses/[id]
  // /job-analyses/[id]/analysis
  // /job-analyses/kanban
  // /job-analyses/kanban/[id]
  // /job-analyses/kanban/[id]/analysis
  const segments = pathname.startsWith("/job-analyses/")
    ? pathname.slice("/job-analyses/".length).split("/").map(decodeURIComponent)
    : [];

  const view: JobMatchAnalysisRouteView =
    segments[0] === "kanban" ? "kanban" : "list";
  const analysisId =
    view === "kanban" ? segments[1] || null : segments[0] || null;
  const isAnalysisView =
    view === "kanban" ? segments[2] === "analysis" : segments[1] === "analysis";
  const analysisTab = normalizeTab(searchParams.get("tab"));

  const hrefFor = useCallback(
    (
      nextId: string | null,
      analysis = false,
      tab: AnalysisTab = "summary",
      nextView: JobMatchAnalysisRouteView = view,
    ) => {
      const base =
        nextView === "kanban" ? "/job-analyses/kanban" : "/job-analyses";
      if (!nextId) return base;
      const encodedId = encodeURIComponent(nextId);
      if (!analysis) return `${base}/${encodedId}`;
      if (tab === "summary") return `${base}/${encodedId}/analysis`;
      return `${base}/${encodedId}/analysis?tab=${tab}`;
    },
    [view],
  );

  const selectAnalysis = useCallback(
    (id: string) => {
      router.push(hrefFor(id));
    },
    [hrefFor, router],
  );

  const replaceAnalysis = useCallback(
    (id: string) => {
      router.replace(hrefFor(id));
    },
    [hrefFor, router],
  );

  const clearSelection = useCallback(() => {
    router.replace(hrefFor(null));
  }, [hrefFor, router]);

  const goToBoard = useCallback(() => {
    router.push("/job-analyses/kanban");
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

  const goToExtraction = useCallback(() => {
    if (!analysisId) return;
    router.push(hrefFor(analysisId));
  }, [hrefFor, analysisId, router]);

  const setAnalysisTab = useCallback(
    (tab: AnalysisTab) => {
      if (!analysisId) return;
      router.push(hrefFor(analysisId, true, tab));
    },
    [hrefFor, analysisId, router],
  );

  return {
    view,
    analysisId,
    isAnalysisView,
    analysisTab,
    pathname,
    hrefFor,
    selectAnalysis,
    replaceAnalysis,
    clearSelection,
    goToBoard,
    goToListView,
    goToKanbanView,
    goToAnalysis,
    goToExtraction,
    setAnalysisTab,
  };
}
