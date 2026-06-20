import type { AIProvider } from "@/backend/modules/shared";
import type { SelfAssessmentContent } from "../value-objects/self-assessment-content.value-object";

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
  generate(input: ReviewSelfAssessmentAIInput): Promise<SelfAssessmentContent>;
}

export interface ReviewSelfAssessmentAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): ReviewSelfAssessmentAIService;
}
