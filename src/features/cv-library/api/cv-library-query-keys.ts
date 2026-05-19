export const cvLibraryQueryKeys = {
  all: ["cv-library"] as const,
  lists: () => [...cvLibraryQueryKeys.all, "list"] as const,
  list: () => [...cvLibraryQueryKeys.lists(), "all"] as const,
  details: () => [...cvLibraryQueryKeys.all, "detail"] as const,
  detail: (id: string | null) => [...cvLibraryQueryKeys.details(), id] as const,
  analyses: () => [...cvLibraryQueryKeys.all, "analyses"] as const,
  interviewQuestions: () =>
    [...cvLibraryQueryKeys.all, "interview-questions"] as const,
};
