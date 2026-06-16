import {
  shouldAutoSelectFirstItem,
  shouldShowMainLoader,
  type ListDetailLoadingState,
} from "@/frontend/list-detail/list-detail-loading-state";
import type {
  JobMatchAnalysisRouteMode,
  JobMatchAnalysisRouteView,
} from "../hooks/use-job-match-analysis-route-state";
import { JOB_MATCH_ROUTE_VIEWS } from "../constants";

interface JobMatchAnalysisAutoSelectionState {
  analysisCount: number;
  analysisId: string | null;
  isListPending: boolean;
  mode: JobMatchAnalysisRouteMode;
  pathname: string;
  view: JobMatchAnalysisRouteView;
}

interface JobMatchAnalysisMainLoaderState extends JobMatchAnalysisAutoSelectionState {
  isDetailPending: boolean;
}

function toListDetailState(
  state: JobMatchAnalysisAutoSelectionState & { isDetailPending?: boolean },
): ListDetailLoadingState {
  return {
    isListPending: state.isListPending,
    isDetailPending: state.isDetailPending ?? false,
    itemCount: state.analysisCount,
    selectedId: state.analysisId,
    isOnListRoute:
      state.view === JOB_MATCH_ROUTE_VIEWS.list &&
      state.mode === "list" &&
      state.pathname === "/job-analyses",
  };
}

export function shouldAutoSelectJobMatchAnalysis(
  state: JobMatchAnalysisAutoSelectionState,
) {
  return shouldAutoSelectFirstItem(toListDetailState(state));
}

export function shouldShowJobMatchAnalysisMainLoader(
  state: JobMatchAnalysisMainLoaderState,
) {
  if (state.mode === "new") return false;
  return shouldShowMainLoader(toListDetailState(state));
}
