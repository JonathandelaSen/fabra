import type {
  InterviewQuestionAIInput,
  InterviewQuestionAIService,
} from "../../domain/repositories/interview-question-ai.service";

class MockInterviewQuestionAIService implements InterviewQuestionAIService {
  async generateAnswer(input: InterviewQuestionAIInput): Promise<string> {
    return `A strong answer should directly address "${input.question}", give a concrete example, explain the tradeoff, and close with the result or lesson learned.`;
  }

  async editAnswer(input: InterviewQuestionAIInput): Promise<string> {
    return `Revised answer: ${input.instruction ?? input.question}. Keep it concise, specific, and grounded in a real engineering situation.`;
  }
}

export class MockInterviewQuestionAIServiceFactory {
  create(): InterviewQuestionAIService {
    return new MockInterviewQuestionAIService();
  }
}
