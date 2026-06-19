import {
  shouldAutoSelectFirstItem,
  shouldShowDetailLoader,
  shouldShowListShellLoader,
  type ListDetailLoadingState,
} from "@/frontend/utils/list-detail-loading-state/list-detail-loading-state";

interface InterviewQuestionsAutoSelectionState {
  isListPending: boolean;
  pathname: string;
  questionCount: number;
  questionId: string | null;
}

interface InterviewQuestionsLoaderState extends InterviewQuestionsAutoSelectionState {
  isDetailPending: boolean;
}

function toListDetailState(
  state: InterviewQuestionsAutoSelectionState & { isDetailPending?: boolean },
): ListDetailLoadingState {
  return {
    isListPending: state.isListPending,
    isDetailPending: state.isDetailPending ?? false,
    itemCount: state.questionCount,
    selectedId: state.questionId,
    isOnListRoute: state.pathname === "/interview-questions",
  };
}

export function shouldAutoSelectInterviewQuestion(
  state: InterviewQuestionsAutoSelectionState,
) {
  return shouldAutoSelectFirstItem(toListDetailState(state));
}

export function shouldShowInterviewQuestionsShellLoader(
  state: InterviewQuestionsLoaderState,
) {
  return shouldShowListShellLoader(toListDetailState(state));
}

export function shouldShowInterviewQuestionsDetailLoader(
  state: InterviewQuestionsLoaderState,
) {
  return shouldShowDetailLoader(toListDetailState(state));
}
