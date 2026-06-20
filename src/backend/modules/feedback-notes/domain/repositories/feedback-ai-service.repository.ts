import type { FeedbackEntryPrimitives } from "../entities/feedback-entry.entity";
import type { AIProvider } from "@/backend/modules/shared";
import type { FinalFeedbackText } from "../value-objects/final-feedback-text.value-object";

export interface GenerateFinalFeedbackInput {
  personName: string;
  entries: Pick<FeedbackEntryPrimitives, "content" | "created_at">[];
}

export interface FeedbackAIService {
  generateFinalFeedback(input: GenerateFinalFeedbackInput): Promise<FinalFeedbackText>;
}

export interface FeedbackAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): FeedbackAIService;
}
