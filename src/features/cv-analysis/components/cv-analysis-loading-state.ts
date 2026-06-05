import type { CVAnalysisRouteMode } from "../hooks/use-cv-analysis-route-state";

interface CVAnalysisAutoSelectionState {
  analysisCount: number;
  isResolvingList: boolean;
  mode: CVAnalysisRouteMode;
  selectedAnalysisId: string | null;
}

interface CVAnalysisMainLoaderState extends CVAnalysisAutoSelectionState {
  isResolvingDetail: boolean;
}

export function shouldAutoSelectCVAnalysis({
  analysisCount,
  isResolvingList,
  mode,
  selectedAnalysisId,
}: CVAnalysisAutoSelectionState) {
  return mode === "list" && !isResolvingList && !selectedAnalysisId && analysisCount > 0;
}

export function shouldShowCVAnalysisMainLoader(state: CVAnalysisMainLoaderState) {
  if (state.mode === "new") return false;
  return state.isResolvingList || state.isResolvingDetail || shouldAutoSelectCVAnalysis(state);
}
