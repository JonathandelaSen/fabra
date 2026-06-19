import type { OllamaCVScoringAIServiceFactory } from "./ollama-cv-scoring-ai.service";
import { ErrorCode } from "@/shared/error-codes";
import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/modules/shared";
import type {
  CVScoringAIService,
  CVScoringAIServiceFactory,
} from "../../domain/repositories/cv-scoring-ai.service";
import type { GeminiCVScoringAIServiceFactory } from "./gemini-cv-scoring-ai.service";
import type { OpenAICVScoringAIServiceFactory } from "./openai-cv-scoring-ai.service";
import type { MockCVScoringAIServiceFactory } from "./mock-cv-scoring-ai.service";

export class ProviderCVScoringAIServiceFactory
  implements CVScoringAIServiceFactory
{
  constructor(
    private readonly deps: {
      geminiFactory: GeminiCVScoringAIServiceFactory;
      openaiFactory: OpenAICVScoringAIServiceFactory;
      mockFactory: MockCVScoringAIServiceFactory;
      ollamaFactory: OllamaCVScoringAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<CVScoringAIServiceFactory["create"]>[0],
  ): CVScoringAIService {
    assertAIProviderAllowedForRuntime(config.provider);
    const factories = {
      [AI_PROVIDER.GEMINI]: () => this.deps.geminiFactory.create(config),
      [AI_PROVIDER.OPENAI]: () => this.deps.openaiFactory.create(config),
      [AI_PROVIDER.OLLAMA]: () => this.deps.ollamaFactory.create(config),
      [AI_PROVIDER.MOCK]: () => this.deps.mockFactory.create(),
    };
    const createService = factories[config.provider];
    if (!createService) throw badRequest("Unsupported AI provider for CV analysis.", ErrorCode.AI_PROVIDER_UNSUPPORTED);
    return createService();
  }
}
