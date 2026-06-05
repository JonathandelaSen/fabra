interface ReceivedFeedbackAutoSelectionState {
  activeSelectedId: string | null;
  isCreating: boolean;
  isResolvingQueries: boolean;
  itemCount: number;
}

interface ReceivedFeedbackMissingSelectionState {
  isResolvingQueries: boolean;
  routeSelectedId: string | null;
  selectedItemExists: boolean;
}

export function shouldAutoSelectReceivedFeedback({
  activeSelectedId,
  isCreating,
  isResolvingQueries,
  itemCount,
}: ReceivedFeedbackAutoSelectionState) {
  return !isResolvingQueries && !activeSelectedId && !isCreating && itemCount > 0;
}

export function shouldShowReceivedFeedbackMainLoader(state: ReceivedFeedbackAutoSelectionState) {
  return state.isResolvingQueries || shouldAutoSelectReceivedFeedback(state);
}

export function shouldClearMissingReceivedFeedbackSelection({
  isResolvingQueries,
  routeSelectedId,
  selectedItemExists,
}: ReceivedFeedbackMissingSelectionState) {
  return Boolean(routeSelectedId && !isResolvingQueries && !selectedItemExists);
}
