import type { CVRecommendationAnalysis } from "@/lib/analysis-types";

export interface CVRecommendationsResponse {
  analysis: CVRecommendationAnalysis | null;
}
