export const cvEditorKeys = {
  all: ["cv-editor"] as const,
  recommendations: (sourceCvId: string | null | undefined) =>
    [...cvEditorKeys.all, "recommendations", sourceCvId ?? "none"] as const,
};
