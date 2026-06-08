import type { JobMatchAnalysisOfferStatus } from "@/app/api/job-match-analyses/responses";
import type { JobMatchAnalysisSummary } from "../../api/job-match-analysis-api";

export const JOB_MATCH_KANBAN_STATUSES: readonly JobMatchAnalysisOfferStatus[] = [
  "interesting",
  "applied",
  "interview",
  "offer",
  "rejected",
  "discarded",
];

export type JobMatchKanbanColumns = Record<
  JobMatchAnalysisOfferStatus,
  JobMatchAnalysisSummary[]
>;

export function getJobMatchKanbanStatus(
  analysis: Pick<JobMatchAnalysisSummary, "offerStatus">,
): JobMatchAnalysisOfferStatus {
  return analysis.offerStatus ?? "interesting";
}

function createEmptyColumns(): JobMatchKanbanColumns {
  return JOB_MATCH_KANBAN_STATUSES.reduce((columns, status) => {
    columns[status] = [];
    return columns;
  }, {} as JobMatchKanbanColumns);
}

function timestamp(value: string | null): number | null {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function compareCards(
  first: JobMatchAnalysisSummary,
  second: JobMatchAnalysisSummary,
) {
  const firstAction = timestamp(first.offerNextActionAt);
  const secondAction = timestamp(second.offerNextActionAt);

  if (firstAction !== null || secondAction !== null) {
    if (firstAction === null) return 1;
    if (secondAction === null) return -1;
    if (firstAction !== secondAction) return firstAction - secondAction;
  }

  const firstScore = first.aiScore ?? -1;
  const secondScore = second.aiScore ?? -1;
  if (firstScore !== secondScore) return secondScore - firstScore;

  return (timestamp(second.createdAt) ?? 0) - (timestamp(first.createdAt) ?? 0);
}

export function buildJobMatchKanbanColumns(
  analyses: JobMatchAnalysisSummary[],
): JobMatchKanbanColumns {
  const columns = createEmptyColumns();

  for (const analysis of analyses) {
    columns[getJobMatchKanbanStatus(analysis)].push(analysis);
  }

  for (const status of JOB_MATCH_KANBAN_STATUSES) {
    columns[status].sort(compareCards);
  }

  return columns;
}
