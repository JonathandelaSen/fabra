import type {
  JobAnalysisChatAIInput,
  JobAnalysisChatAIService,
} from "../../domain/repositories/job-analysis-chat-ai-service.repository";
import { JobAnalysisChatContent } from "../../domain/value-objects/job-analysis-chat-content.value-object";

class MockJobAnalysisChatAIService implements JobAnalysisChatAIService {
  async generateAnswer(input: JobAnalysisChatAIInput): Promise<JobAnalysisChatContent> {
    return JobAnalysisChatContent.fromPrimitives(
      `Based on the current analysis, "${input.message}" is best answered by focusing on the strongest matching evidence, the remaining gaps, and one practical next step. Conversation context includes ${input.history.length} previous messages.`,
    );
  }
}

export class MockJobAnalysisChatAIServiceFactory {
  create(): JobAnalysisChatAIService {
    return new MockJobAnalysisChatAIService();
  }
}
