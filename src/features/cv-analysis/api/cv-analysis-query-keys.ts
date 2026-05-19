export const cvAnalysisQueryKeys = {
  all: ["cv-analysis"] as const,
  lists: () => [...cvAnalysisQueryKeys.all, "list"] as const,
  list: () => [...cvAnalysisQueryKeys.lists(), "general"] as const,
  details: () => [...cvAnalysisQueryKeys.all, "detail"] as const,
  detail: (id: string | null) => [...cvAnalysisQueryKeys.details(), id] as const,
  cvOptions: () => [...cvAnalysisQueryKeys.all, "cv-options"] as const,
  interviewQuestions: (analysisId: string | null) =>
    [...cvAnalysisQueryKeys.all, "interview-questions", analysisId] as const,
};
