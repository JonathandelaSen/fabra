export interface WorkspaceMetricsResponse {
  counts: {
    workJournalEntries: number;
    commitments: number;
    activityContexts: number;
  };
  windowDays: number | null;
}
