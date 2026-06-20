import type {
  InterviewQuestionAIInput,
  InterviewQuestionAIService,
} from "../../domain/repositories/interview-question-ai.service";
import { InterviewAnswer } from "../../domain/value-objects/interview-answer.value-object";

class MockInterviewQuestionAIService implements InterviewQuestionAIService {
  async generate(input: InterviewQuestionAIInput): Promise<InterviewAnswer> {
    if (input.instruction) {
      return InterviewAnswer.fromPrimitives(
        `Revised answer: ${input.instruction}. Keep it concise, specific, and grounded in a real engineering situation.`,
      );
    }
    return InterviewAnswer.fromPrimitives(
      `A strong answer should directly address "${input.question}", give a concrete example, explain the tradeoff, and close with the result or lesson learned.`,
    );
  }
}

export class MockInterviewQuestionAIServiceFactory {
  create(): InterviewQuestionAIService {
    return new MockInterviewQuestionAIService();
  }
}
