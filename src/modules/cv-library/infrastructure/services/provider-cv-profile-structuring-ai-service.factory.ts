import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/modules/shared";
import type {
  CVProfileStructuringAIService,
  CVProfileStructuringAIServiceFactory,
} from "../../domain/repositories/cv-profile-ai.service";
import type { GeminiCVProfileStructuringAIServiceFactory } from "./gemini-cv-profile-structuring-ai.service";
import type { OpenAICVProfileStructuringAIServiceFactory } from "./openai-cv-profile-structuring-ai.service";
import type { MockCVProfileStructuringAIServiceFactory } from "./mock-cv-profile-structuring-ai.service";
import type { OllamaCVProfileStructuringAIServiceFactory } from "./ollama-cv-profile-structuring-ai.service";

export class ProviderCVProfileStructuringAIServiceFactory
  implements CVProfileStructuringAIServiceFactory
{
  constructor(
    private readonly deps: {
      geminiFactory: GeminiCVProfileStructuringAIServiceFactory;
      openaiFactory: OpenAICVProfileStructuringAIServiceFactory;
      mockFactory: MockCVProfileStructuringAIServiceFactory;
      ollamaFactory: OllamaCVProfileStructuringAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<CVProfileStructuringAIServiceFactory["create"]>[0],
  ): CVProfileStructuringAIService {
    assertAIProviderAllowedForRuntime(config.provider);
    const factories = {
      [AI_PROVIDER.GEMINI]: () => this.deps.geminiFactory.create(config),
      [AI_PROVIDER.OPENAI]: () => this.deps.openaiFactory.create(config),
      [AI_PROVIDER.OLLAMA]: () => this.deps.ollamaFactory.create(config),
      [AI_PROVIDER.MOCK]: () => this.deps.mockFactory.create(),
    };
    const createService = factories[config.provider];
    if (!createService) throw badRequest("Unsupported AI provider for structuring CVs.");
    return createService();
  }
}
