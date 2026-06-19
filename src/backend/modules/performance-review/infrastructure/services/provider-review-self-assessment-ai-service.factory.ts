import { ErrorCode } from "@/shared/error-codes";
import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/modules/shared";
import type {
  ReviewSelfAssessmentAIService,
  ReviewSelfAssessmentAIServiceFactory,
} from "../../domain/repositories/review-self-assessment-ai.service";
import type { GeminiReviewSelfAssessmentAIServiceFactory } from "./gemini-review-self-assessment-ai.service";
import type { MockReviewSelfAssessmentAIServiceFactory } from "./mock-review-self-assessment-ai.service";
import type { OllamaReviewSelfAssessmentAIServiceFactory } from "./ollama-review-self-assessment-ai.service";
import type { OpenAIReviewSelfAssessmentAIServiceFactory } from "./openai-review-self-assessment-ai.service";

export class ProviderReviewSelfAssessmentAIServiceFactory
  implements ReviewSelfAssessmentAIServiceFactory
{
  constructor(
    private readonly deps: {
      geminiFactory: GeminiReviewSelfAssessmentAIServiceFactory;
      openaiFactory: OpenAIReviewSelfAssessmentAIServiceFactory;
      mockFactory: MockReviewSelfAssessmentAIServiceFactory;
      ollamaFactory: OllamaReviewSelfAssessmentAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<ReviewSelfAssessmentAIServiceFactory["create"]>[0],
  ): ReviewSelfAssessmentAIService {
    assertAIProviderAllowedForRuntime(config.provider);
    const factories = {
      [AI_PROVIDER.GEMINI]: () => this.deps.geminiFactory.create(config),
      [AI_PROVIDER.OPENAI]: () => this.deps.openaiFactory.create(config),
      [AI_PROVIDER.OLLAMA]: () => this.deps.ollamaFactory.create(config),
      [AI_PROVIDER.MOCK]: () => this.deps.mockFactory.create(),
    };
    const createService = factories[config.provider];
    if (!createService) {
      throw badRequest("Unsupported AI provider for self-assessment.", ErrorCode.AI_PROVIDER_UNSUPPORTED);
    }
    return createService();
  }
}
