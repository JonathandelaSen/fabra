import type {
  FeedbackAIService,
  GenerateFinalFeedbackInput,
} from "../../domain/repositories/feedback-ai-service.repository";

class MockFeedbackAIService implements FeedbackAIService {
  async generateFinalFeedback(input: GenerateFinalFeedbackInput): Promise<string> {
    return `Final feedback for ${input.personName}: consolidated from ${input.entries.length} notes, with emphasis on observable impact, collaboration patterns, and practical next steps.`;
  }
}

export class MockFeedbackAIServiceFactory {
  create(): FeedbackAIService {
    return new MockFeedbackAIService();
  }
}
