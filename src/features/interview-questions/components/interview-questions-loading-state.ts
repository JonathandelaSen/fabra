interface InterviewQuestionsAutoSelectionState {
  isResolvingList: boolean;
  pathname: string;
  questionCount: number;
  questionId: string | null;
}

interface InterviewQuestionsLoaderState extends InterviewQuestionsAutoSelectionState {
  isResolvingDetail: boolean;
}

export function shouldAutoSelectInterviewQuestion({
  isResolvingList,
  pathname,
  questionCount,
  questionId,
}: InterviewQuestionsAutoSelectionState) {
  return (
    pathname === "/interview-questions" &&
    !questionId &&
    !isResolvingList &&
    questionCount > 0
  );
}

export function shouldShowInterviewQuestionsShellLoader({
  isResolvingList,
  questionCount,
}: InterviewQuestionsLoaderState) {
  return isResolvingList && questionCount === 0;
}

export function shouldShowInterviewQuestionsDetailLoader(
  state: InterviewQuestionsLoaderState,
) {
  return state.isResolvingDetail || shouldAutoSelectInterviewQuestion(state);
}
