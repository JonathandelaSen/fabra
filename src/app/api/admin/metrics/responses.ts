export interface GroupMetricsResponse {
  counts: Record<string, number>;
  windowDays: number | null;
}
