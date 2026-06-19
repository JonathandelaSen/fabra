import {
  shouldAutoSelectFirstItem,
  shouldShowDetailLoader,
  shouldShowListShellLoader,
  type ListDetailLoadingState,
} from "@/frontend/utils/list-detail-loading-state/list-detail-loading-state";

interface CVLibraryAutoSelectionState {
  cvCount: number;
  isListPending: boolean;
  pathname: string;
  selectedCvId: string | null;
}

interface CVLibraryLoaderState extends CVLibraryAutoSelectionState {
  isDetailPending: boolean;
}

function toListDetailState(
  state: CVLibraryAutoSelectionState & { isDetailPending?: boolean },
): ListDetailLoadingState {
  return {
    isListPending: state.isListPending,
    isDetailPending: state.isDetailPending ?? false,
    itemCount: state.cvCount,
    selectedId: state.selectedCvId,
    isOnListRoute: state.pathname === "/cvs",
  };
}

export function shouldAutoSelectCVLibraryItem(state: CVLibraryAutoSelectionState) {
  return shouldAutoSelectFirstItem(toListDetailState(state));
}

export function shouldShowCVLibraryShellLoader(state: CVLibraryLoaderState) {
  return shouldShowListShellLoader(toListDetailState(state));
}

export function shouldShowCVLibraryDetailLoader(state: CVLibraryLoaderState) {
  return shouldShowDetailLoader(toListDetailState(state));
}
