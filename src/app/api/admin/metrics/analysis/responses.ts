export interface AnalysisMetricsResponse {
  counts: {
    jobMatchAnalyses: number;
    analysisChatConversations: number;
    analysisChatMessages: number;
    interviewQuestions: number;
  };
  windowDays: number | null;
}
