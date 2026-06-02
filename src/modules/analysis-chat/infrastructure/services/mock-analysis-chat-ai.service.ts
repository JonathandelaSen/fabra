import type {
  AnalysisChatAIInput,
  AnalysisChatAIService,
} from "../../domain/repositories/analysis-chat-ai-service.repository";

class MockAnalysisChatAIService implements AnalysisChatAIService {
  async generateAnswer(input: AnalysisChatAIInput): Promise<string> {
    return `Based on the current analysis, "${input.message}" is best answered by focusing on the strongest matching evidence, the remaining gaps, and one practical next step. Conversation context includes ${input.history.length} previous messages.`;
  }
}

export class MockAnalysisChatAIServiceFactory {
  create(): AnalysisChatAIService {
    return new MockAnalysisChatAIService();
  }
}
