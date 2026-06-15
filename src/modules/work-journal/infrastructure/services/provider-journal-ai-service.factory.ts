import type { OllamaJournalAIServiceFactory } from "./ollama-journal-ai.service";
import { ErrorCode } from "@/shared/error-codes";
import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/modules/shared";
import type {
  JournalAIService,
  JournalAIServiceFactory,
} from "../../domain/repositories/journal-ai-service.repository";
import type { GeminiJournalAIServiceFactory } from "./gemini-journal-ai.service";
import type { OpenAIJournalAIServiceFactory } from "./openai-journal-ai.service";
import type { MockJournalAIServiceFactory } from "./mock-journal-ai.service";

export class ProviderJournalAIServiceFactory implements JournalAIServiceFactory {
  constructor(
    private readonly deps: {
      geminiFactory: GeminiJournalAIServiceFactory;
      openaiFactory: OpenAIJournalAIServiceFactory;
      mockFactory: MockJournalAIServiceFactory;
      ollamaFactory: OllamaJournalAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<JournalAIServiceFactory["create"]>[0],
  ): JournalAIService {
    assertAIProviderAllowedForRuntime(config.provider);
    const factories = {
      [AI_PROVIDER.GEMINI]: () => this.deps.geminiFactory.create(config),
      [AI_PROVIDER.OPENAI]: () => this.deps.openaiFactory.create(config),
      [AI_PROVIDER.OLLAMA]: () => this.deps.ollamaFactory.create(config),
      [AI_PROVIDER.MOCK]: () => this.deps.mockFactory.create(),
    };
    const createService = factories[config.provider];
    if (!createService) throw badRequest("Unsupported AI provider for work journal.", ErrorCode.AI_PROVIDER_UNSUPPORTED);
    return createService();
  }
}
