export interface FeedbackMetricsResponse {
  counts: {
    feedbackNotesFeedbacks: number;
    receivedFeedback: number;
  };
  windowDays: number | null;
}
