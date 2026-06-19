import type { OllamaInterviewQuestionAIServiceFactory } from "./ollama-interview-question-ai.service";
import { ErrorCode } from "@/shared/error-codes";
import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/backend/modules/shared";
import type {
  InterviewQuestionAIService,
  InterviewQuestionAIServiceFactory,
} from "../../domain/repositories/interview-question-ai.service";
import type { GeminiInterviewQuestionAIServiceFactory } from "./gemini-interview-question-ai.service";
import type { OpenAIInterviewQuestionAIServiceFactory } from "./openai-interview-question-ai.service";
import type { MockInterviewQuestionAIServiceFactory } from "./mock-interview-question-ai.service";

export class ProviderInterviewQuestionAIServiceFactory
  implements InterviewQuestionAIServiceFactory
{
  constructor(
    private readonly deps: {
      geminiFactory: GeminiInterviewQuestionAIServiceFactory;
      openaiFactory: OpenAIInterviewQuestionAIServiceFactory;
      mockFactory: MockInterviewQuestionAIServiceFactory;
      ollamaFactory: OllamaInterviewQuestionAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<InterviewQuestionAIServiceFactory["create"]>[0],
  ): InterviewQuestionAIService {
    assertAIProviderAllowedForRuntime(config.provider);
    const factories = {
      [AI_PROVIDER.GEMINI]: () => this.deps.geminiFactory.create(config),
      [AI_PROVIDER.OPENAI]: () => this.deps.openaiFactory.create(config),
      [AI_PROVIDER.OLLAMA]: () => this.deps.ollamaFactory.create(config),
      [AI_PROVIDER.MOCK]: () => this.deps.mockFactory.create(),
    };
    const createService = factories[config.provider];
    if (!createService) throw badRequest("Unsupported AI provider for interview questions.", ErrorCode.AI_PROVIDER_UNSUPPORTED);
    return createService();
  }
}
