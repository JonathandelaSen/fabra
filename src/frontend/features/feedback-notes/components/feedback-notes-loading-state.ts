import {
  shouldAutoSelectFirstItem,
  shouldShowMainLoader,
  type ListDetailLoadingState,
} from "@/frontend/list-detail/list-detail-loading-state";

interface FeedbackNotesAutoSelectionState {
  feedbackCount: number;
  isListPending: boolean;
  pathname: string;
  selectedFeedbackId: string | null;
}

interface FeedbackNotesLoaderState extends FeedbackNotesAutoSelectionState {
  isDetailPending: boolean;
}

function toListDetailState(
  state: FeedbackNotesAutoSelectionState & { isDetailPending?: boolean },
): ListDetailLoadingState {
  return {
    isListPending: state.isListPending,
    isDetailPending: state.isDetailPending ?? false,
    itemCount: state.feedbackCount,
    selectedId: state.selectedFeedbackId,
    isOnListRoute: state.pathname === "/feedback-notes",
  };
}

export function shouldAutoSelectFeedbackNote(state: FeedbackNotesAutoSelectionState) {
  return shouldAutoSelectFirstItem(toListDetailState(state));
}

export function shouldShowFeedbackNotesContentLoader(state: FeedbackNotesLoaderState) {
  return shouldShowMainLoader(toListDetailState(state));
}
