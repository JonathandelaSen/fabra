import {
  shouldAutoSelectFirstItem,
  shouldShowMainLoader,
  type ListDetailLoadingState,
} from "@/frontend/list-detail/list-detail-loading-state";

interface ReceivedFeedbackAutoSelectionState {
  activeSelectedId: string | null;
  isCreating: boolean;
  isListPending: boolean;
  itemCount: number;
}

interface ReceivedFeedbackMainLoaderState extends ReceivedFeedbackAutoSelectionState {
  isContextsPending: boolean;
}

interface ReceivedFeedbackMissingSelectionState {
  isListPending: boolean;
  routeSelectedId: string | null;
  selectedItemExists: boolean;
}

function toListDetailState(
  state: ReceivedFeedbackAutoSelectionState & { isContextsPending?: boolean },
): ListDetailLoadingState {
  return {
    isListPending: state.isListPending,
    isDetailPending: state.isContextsPending ?? false,
    itemCount: state.itemCount,
    selectedId: state.activeSelectedId,
    isOnListRoute: true,
  };
}

export function shouldAutoSelectReceivedFeedback(state: ReceivedFeedbackAutoSelectionState) {
  if (state.isCreating) return false;
  return shouldAutoSelectFirstItem(toListDetailState(state));
}

export function shouldShowReceivedFeedbackMainLoader(state: ReceivedFeedbackMainLoaderState) {
  if (state.isCreating) return false;
  return shouldShowMainLoader(toListDetailState(state));
}

export function shouldClearMissingReceivedFeedbackSelection({
  isListPending,
  routeSelectedId,
  selectedItemExists,
}: ReceivedFeedbackMissingSelectionState) {
  return Boolean(routeSelectedId && !isListPending && !selectedItemExists);
}
