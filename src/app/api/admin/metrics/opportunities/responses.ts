export interface OpportunitiesMetricsResponse {
  counts: {
    jobOpportunities: number;
    processQuestions: number;
  };
  windowDays: number | null;
}
