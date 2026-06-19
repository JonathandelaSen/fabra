import type { OllamaCVChatAIServiceFactory } from "./ollama-cv-chat-ai.service";
import { ErrorCode } from "@/shared/error-codes";
import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/modules/shared";
import type {
  CVChatAIService,
  CVChatAIServiceFactory,
} from "../../domain/repositories/cv-chat-ai-service.repository";
import type { GeminiCVChatAIServiceFactory } from "./gemini-cv-chat-ai.service";
import type { OpenAICVChatAIServiceFactory } from "./openai-cv-chat-ai.service";
import type { MockCVChatAIServiceFactory } from "./mock-cv-chat-ai.service";

export class ProviderCVChatAIServiceFactory
  implements CVChatAIServiceFactory
{
  constructor(
    private readonly deps: {
      geminiFactory: GeminiCVChatAIServiceFactory;
      openaiFactory: OpenAICVChatAIServiceFactory;
      mockFactory: MockCVChatAIServiceFactory;
      ollamaFactory: OllamaCVChatAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<CVChatAIServiceFactory["create"]>[0],
  ): CVChatAIService {
    assertAIProviderAllowedForRuntime(config.provider);
    const factories = {
      [AI_PROVIDER.GEMINI]: () => this.deps.geminiFactory.create(config),
      [AI_PROVIDER.OPENAI]: () => this.deps.openaiFactory.create(config),
      [AI_PROVIDER.OLLAMA]: () => this.deps.ollamaFactory.create(config),
      [AI_PROVIDER.MOCK]: () => this.deps.mockFactory.create(),
    };
    const createService = factories[config.provider];
    if (!createService) throw badRequest("Unsupported AI provider for chat.", ErrorCode.AI_PROVIDER_UNSUPPORTED);
    return createService();
  }
}
