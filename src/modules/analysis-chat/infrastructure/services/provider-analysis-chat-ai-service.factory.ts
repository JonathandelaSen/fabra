import type { OllamaAnalysisChatAIServiceFactory } from "./ollama-analysis-chat-ai.service";
import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/modules/shared";
import type {
  AnalysisChatAIService,
  AnalysisChatAIServiceFactory,
} from "../../domain/repositories/analysis-chat-ai-service.repository";
import type { GeminiAnalysisChatAIServiceFactory } from "./gemini-analysis-chat-ai.service";
import type { OpenAIAnalysisChatAIServiceFactory } from "./openai-analysis-chat-ai.service";
import type { MockAnalysisChatAIServiceFactory } from "./mock-analysis-chat-ai.service";

export class ProviderAnalysisChatAIServiceFactory
  implements AnalysisChatAIServiceFactory
{
  constructor(
    private readonly deps: {
      geminiFactory: GeminiAnalysisChatAIServiceFactory;
      openaiFactory: OpenAIAnalysisChatAIServiceFactory;
      mockFactory: MockAnalysisChatAIServiceFactory;
      ollamaFactory: OllamaAnalysisChatAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<AnalysisChatAIServiceFactory["create"]>[0],
  ): AnalysisChatAIService {
    assertAIProviderAllowedForRuntime(config.provider);
    const factories = {
      [AI_PROVIDER.GEMINI]: () => this.deps.geminiFactory.create(config),
      [AI_PROVIDER.OPENAI]: () => this.deps.openaiFactory.create(config),
      [AI_PROVIDER.OLLAMA]: () => this.deps.ollamaFactory.create(config),
      [AI_PROVIDER.MOCK]: () => this.deps.mockFactory.create(),
    };
    const createService = factories[config.provider];
    if (!createService) throw badRequest("Unsupported AI provider for chat.");
    return createService();
  }
}
