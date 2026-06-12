export interface CVPublicFeedbackResponse { id: string; cvId: string; giverName: string | null; giverContext: string | null; feedbackText: string; createdAt: string }
export type ListCVPublicFeedbackResponse = CVPublicFeedbackResponse[];
