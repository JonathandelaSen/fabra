import type { OllamaFeedbackAIServiceFactory } from "./ollama-feedback-ai.service";
import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/modules/shared";
import type {
  FeedbackAIService,
  FeedbackAIServiceFactory,
} from "../../domain/repositories/feedback-ai-service.repository";
import type { GeminiFeedbackAIServiceFactory } from "./gemini-feedback-ai.service";
import type { OpenAIFeedbackAIServiceFactory } from "./openai-feedback-ai.service";
import type { MockFeedbackAIServiceFactory } from "./mock-feedback-ai.service";

export class ProviderFeedbackAIServiceFactory
  implements FeedbackAIServiceFactory
{
  constructor(
    private readonly deps: {
      geminiFactory: GeminiFeedbackAIServiceFactory;
      openaiFactory: OpenAIFeedbackAIServiceFactory;
      mockFactory: MockFeedbackAIServiceFactory;
      ollamaFactory: OllamaFeedbackAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<FeedbackAIServiceFactory["create"]>[0],
  ): FeedbackAIService {
    assertAIProviderAllowedForRuntime(config.provider);
    const factories = {
      [AI_PROVIDER.GEMINI]: () => this.deps.geminiFactory.create(config),
      [AI_PROVIDER.OPENAI]: () => this.deps.openaiFactory.create(config),
      [AI_PROVIDER.OLLAMA]: () => this.deps.ollamaFactory.create(config),
      [AI_PROVIDER.MOCK]: () => this.deps.mockFactory.create(),
    };
    const createService = factories[config.provider];
    if (!createService) throw badRequest("Unsupported AI provider for feedback.");
    return createService();
  }
}
