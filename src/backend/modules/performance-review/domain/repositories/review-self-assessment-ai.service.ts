import type { AIProvider } from "@/backend/modules/shared";

export interface ReviewSelfAssessmentEvidenceInput {
  source: string;
  date: string | null;
  content: string;
  highlighted: boolean;
}

export interface ReviewSelfAssessmentAIInput {
  title: string;
  reviewType: string;
  periodStart: string;
  periodEnd: string;
  evidence: ReviewSelfAssessmentEvidenceInput[];
}

export interface ReviewSelfAssessmentAIService {
  generate(input: ReviewSelfAssessmentAIInput): Promise<string>;
}

export interface ReviewSelfAssessmentAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): ReviewSelfAssessmentAIService;
}
