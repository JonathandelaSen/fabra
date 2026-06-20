import type { AIProvider } from "@/backend/modules/shared";

export interface JobMatchScoringAIResult {
  score: number;
  feedback: string;
  aiKeywords: string[];
  improvements: string[];
  jobKeyData: unknown | null;
  jobKeywords: string[];
  cvKeywords: string[];
  matchingKeywords: string[];
  missingKeywords: string[];
}

export type JobMatchScoringAIResultPrimitives = JobMatchScoringAIResult;

export interface JobMatchScoringAIInput {
  text: string;
  jobDescription: string;
  jobUrl?: string | null;
  language?: string | null;
}

import type { JobMatchScoringAIResultVO } from "../value-objects/job-match-scoring-ai-result.value-object";

export interface JobMatchScoringAIService {
  score(input: JobMatchScoringAIInput): Promise<JobMatchScoringAIResultVO>;
}

export interface JobMatchScoringAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): JobMatchScoringAIService;
}
