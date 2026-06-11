export const performanceReviewQueryKeys = {
  all: ["performance-review"] as const,
  list: () => [...performanceReviewQueryKeys.all, "list"] as const,
  detail: (id: string) =>
    [...performanceReviewQueryKeys.all, "detail", id] as const,
  evidence: (id: string) =>
    [...performanceReviewQueryKeys.all, "evidence", id] as const,
  candidates: (id: string) =>
    [...performanceReviewQueryKeys.all, "candidates", id] as const,
  contexts: () => [...performanceReviewQueryKeys.all, "contexts"] as const,
};
