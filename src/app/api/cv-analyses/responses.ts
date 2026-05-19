import type { Analysis, AnalysisSummary } from "@/lib/analysis-types";

export type CVAnalysisSummaryResponse = AnalysisSummary;
export type CVAnalysisDetailResponse = Analysis;

export type ListCVAnalysesResponse = CVAnalysisSummaryResponse[];
export type CreateCVAnalysisResponse = CVAnalysisDetailResponse;
export type GetCVAnalysisResponse = CVAnalysisDetailResponse;
export type ScoreCVAnalysisResponse = CVAnalysisDetailResponse;

export interface DeleteCVAnalysisResponse {
  success: true;
}

export function toCVAnalysisSummaryResponse(
  input: AnalysisSummary,
): CVAnalysisSummaryResponse {
  return input;
}

export function toCVAnalysisDetailResponse(
  input: Analysis,
): CVAnalysisDetailResponse {
  return input;
}
