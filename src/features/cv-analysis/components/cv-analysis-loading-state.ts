import {
  shouldAutoSelectFirstItem,
  shouldShowMainLoader,
  type ListDetailLoadingState,
} from "@/frontend/list-detail/list-detail-loading-state";
import type { CVAnalysisRouteMode } from "../hooks/use-cv-analysis-route-state";

interface CVAnalysisAutoSelectionState {
  analysisCount: number;
  isListPending: boolean;
  mode: CVAnalysisRouteMode;
  selectedAnalysisId: string | null;
}

interface CVAnalysisMainLoaderState extends CVAnalysisAutoSelectionState {
  isDetailPending: boolean;
}

function toListDetailState(
  state: CVAnalysisAutoSelectionState & { isDetailPending?: boolean },
): ListDetailLoadingState {
  return {
    isListPending: state.isListPending,
    isDetailPending: state.isDetailPending ?? false,
    itemCount: state.analysisCount,
    selectedId: state.selectedAnalysisId,
    isOnListRoute: state.mode === "list",
  };
}

export function shouldAutoSelectCVAnalysis(state: CVAnalysisAutoSelectionState) {
  return shouldAutoSelectFirstItem(toListDetailState(state));
}

export function shouldShowCVAnalysisMainLoader(state: CVAnalysisMainLoaderState) {
  if (state.mode === "new") return false;
  return shouldShowMainLoader(toListDetailState(state));
}
