import type {
  JobMatchAnalysisRouteMode,
  JobMatchAnalysisRouteView,
} from "../hooks/use-job-match-analysis-route-state";

interface JobMatchAnalysisAutoSelectionState {
  analysisCount: number;
  analysisId: string | null;
  isResolvingList: boolean;
  mode: JobMatchAnalysisRouteMode;
  pathname: string;
  view: JobMatchAnalysisRouteView;
}

interface JobMatchAnalysisMainLoaderState extends JobMatchAnalysisAutoSelectionState {
  isResolvingDetail: boolean;
}

export function shouldAutoSelectJobMatchAnalysis({
  analysisCount,
  analysisId,
  isResolvingList,
  mode,
  pathname,
  view,
}: JobMatchAnalysisAutoSelectionState) {
  return (
    view === "list" &&
    mode === "list" &&
    pathname === "/job-analyses" &&
    !analysisId &&
    !isResolvingList &&
    analysisCount > 0
  );
}

export function shouldShowJobMatchAnalysisMainLoader(state: JobMatchAnalysisMainLoaderState) {
  if (state.mode === "new") return false;
  return (
    state.isResolvingList ||
    state.isResolvingDetail ||
    shouldAutoSelectJobMatchAnalysis(state)
  );
}
