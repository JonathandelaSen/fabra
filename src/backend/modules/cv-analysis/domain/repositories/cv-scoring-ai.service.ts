import type { AIProvider } from "@/backend/modules/shared";
import type { CVScoringAIResult } from "../value-objects/cv-scoring-ai-result.value-object";

export interface CVScoringAIResultPrimitives {
  score: number;
  feedback: string;
  keywords: string[];
  improvements: string[];
}

export interface CVScoringAIInput {
  text: string;
  additionalContext?: string | null;
  language?: string | null;
}

export interface CVScoringAIService {
  score(input: CVScoringAIInput): Promise<CVScoringAIResult>;
}

export interface CVScoringAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): CVScoringAIService;
}
