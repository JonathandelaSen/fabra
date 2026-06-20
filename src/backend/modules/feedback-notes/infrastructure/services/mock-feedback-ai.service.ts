import type {
  FeedbackAIService,
  GenerateFinalFeedbackInput,
} from "../../domain/repositories/feedback-ai-service.repository";
import { FinalFeedbackText } from "../../domain/value-objects/final-feedback-text.value-object";

class MockFeedbackAIService implements FeedbackAIService {
  async generateFinalFeedback(input: GenerateFinalFeedbackInput): Promise<FinalFeedbackText> {
    return FinalFeedbackText.fromPrimitives(`Final feedback for ${input.personName}: consolidated from ${input.entries.length} notes, with emphasis on observable impact, collaboration patterns, and practical next steps.`);
  }
}

export class MockFeedbackAIServiceFactory {
  create(): FeedbackAIService {
    return new MockFeedbackAIService();
  }
}
