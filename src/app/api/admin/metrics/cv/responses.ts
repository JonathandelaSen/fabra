export interface CVMetricsResponse {
  counts: {
    cvs: number;
    cvStructuredProfiles: number;
  };
  windowDays: number | null;
}
