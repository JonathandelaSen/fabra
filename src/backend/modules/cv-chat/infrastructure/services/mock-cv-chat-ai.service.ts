import type {
  CVChatAIInput,
  CVChatAIService,
} from "../../domain/repositories/cv-chat-ai-service.repository";
import { CVChatContent } from "../../domain/value-objects/cv-chat-content.value-object";

class MockCVChatAIService implements CVChatAIService {
  async generateAnswer(input: CVChatAIInput): Promise<CVChatContent> {
    return CVChatContent.fromPrimitives(`[Mock CV chat] The current CV context was loaded for "${input.message}". Focus on truthful evidence, clear positioning, and the highest-impact improvement. Conversation context includes ${input.history.length} previous messages.`);
  }
}

export class MockCVChatAIServiceFactory {
  create(): CVChatAIService {
    return new MockCVChatAIService();
  }
}
