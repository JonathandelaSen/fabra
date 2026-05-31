import type { OllamaCVProfileEditingAIServiceFactory } from "./ollama-cv-profile-editing-ai.service";
import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/modules/shared";
import type {
  CVProfileEditingAIService,
  CVProfileEditingAIServiceFactory,
} from "../../domain/repositories/cv-profile-ai.service";
import type { GeminiCVProfileEditingAIServiceFactory } from "./gemini-cv-profile-editing-ai.service";
import type { OpenAICVProfileEditingAIServiceFactory } from "./openai-cv-profile-editing-ai.service";
import type { MockCVProfileEditingAIServiceFactory } from "./mock-cv-profile-editing-ai.service";

export class ProviderCVProfileEditingAIServiceFactory
  implements CVProfileEditingAIServiceFactory
{
  constructor(
    private readonly deps: {
      geminiFactory: GeminiCVProfileEditingAIServiceFactory;
      openaiFactory: OpenAICVProfileEditingAIServiceFactory;
      mockFactory: MockCVProfileEditingAIServiceFactory;
      ollamaFactory: OllamaCVProfileEditingAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<CVProfileEditingAIServiceFactory["create"]>[0],
  ): CVProfileEditingAIService {
    assertAIProviderAllowedForRuntime(config.provider);
    const factories = {
      [AI_PROVIDER.GEMINI]: () => this.deps.geminiFactory.create(config),
      [AI_PROVIDER.OPENAI]: () => this.deps.openaiFactory.create(config),
      [AI_PROVIDER.OLLAMA]: () => this.deps.ollamaFactory.create(config),
      [AI_PROVIDER.MOCK]: () => this.deps.mockFactory.create(),
    };
    const createService = factories[config.provider];
    if (!createService) throw badRequest("Unsupported AI provider for editing CVs.");
    return createService();
  }
}
