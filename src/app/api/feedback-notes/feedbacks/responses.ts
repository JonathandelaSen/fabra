export type FeedbackStatusResponse = "active" | "closed";

export interface FeedbackResponse {
  id: string;
  userId: string;
  activityContextId: string;
  activityContextName?: string;
  personName: string;
  status: FeedbackStatusResponse;
  finalFeedback: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  entryCount?: number;
}

interface FeedbackPresenterOutput {
  id: string;
  user_id: string;
  activity_context_id: string;
  activity_context_name?: string;
  person_name: string;
  status: FeedbackStatusResponse;
  final_feedback: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  entry_count?: number;
}

export type ListFeedbacksResponse = FeedbackResponse[];
export type CreateFeedbackResponse = FeedbackResponse;

export function toFeedbackResponse(
  feedback: FeedbackPresenterOutput
): FeedbackResponse {
  return {
    id: feedback.id,
    userId: feedback.user_id,
    activityContextId: feedback.activity_context_id,
    activityContextName: feedback.activity_context_name,
    personName: feedback.person_name,
    status: feedback.status,
    finalFeedback: feedback.final_feedback,
    closedAt: feedback.closed_at,
    createdAt: feedback.created_at,
    updatedAt: feedback.updated_at,
    entryCount: feedback.entry_count,
  };
}
