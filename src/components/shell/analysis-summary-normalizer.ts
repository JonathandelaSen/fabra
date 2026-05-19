import type { AnalysisSummary } from "@/lib/analysis-types";
import type { JobMatchAnalysisSummaryResponse } from "@/app/api/job-match-analyses/responses";

type LegacyAnalysisSummary = AnalysisSummary;
type MixedAnalysisSummary = LegacyAnalysisSummary | JobMatchAnalysisSummaryResponse;

function isLegacyAnalysisSummary(
  summary: MixedAnalysisSummary
): summary is LegacyAnalysisSummary {
  return "created_at" in summary;
}

function normalizeAnalysisSummary(summary: MixedAnalysisSummary): AnalysisSummary {
  if (isLegacyAnalysisSummary(summary)) {
    return summary;
  }

  return {
    id: summary.id,
    cv_id: summary.cvId,
    title: summary.title,
    filename: summary.filename,
    created_at: summary.createdAt,
    analysis_mode: "job_match",
    ai_score: summary.aiScore,
    ai_analyzed_at: summary.aiAnalyzedAt,
    job_url: summary.jobUrl,
    offer_status: summary.offerStatus,
    offer_next_action_at: summary.offerNextActionAt,
  };
}

export function normalizeAnalysisSummaries(
  summaries: MixedAnalysisSummary[]
): AnalysisSummary[] {
  return summaries.map(normalizeAnalysisSummary);
}
