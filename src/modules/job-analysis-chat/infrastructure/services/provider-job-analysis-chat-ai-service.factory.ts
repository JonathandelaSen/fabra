import type { OllamaJobAnalysisChatAIServiceFactory } from "./ollama-job-analysis-chat-ai.service";
import { ErrorCode } from "@/shared/error-codes";
import {
  AI_PROVIDER,
  assertAIProviderAllowedForRuntime,
  badRequest,
} from "@/modules/shared";
import type {
  JobAnalysisChatAIService,
  JobAnalysisChatAIServiceFactory,
} from "../../domain/repositories/job-analysis-chat-ai-service.repository";
import type { GeminiJobAnalysisChatAIServiceFactory } from "./gemini-job-analysis-chat-ai.service";
import type { OpenAIJobAnalysisChatAIServiceFactory } from "./openai-job-analysis-chat-ai.service";
import type { MockJobAnalysisChatAIServiceFactory } from "./mock-job-analysis-chat-ai.service";

export class ProviderJobAnalysisChatAIServiceFactory
  implements JobAnalysisChatAIServiceFactory
{
  constructor(
    private readonly deps: {
      geminiFactory: GeminiJobAnalysisChatAIServiceFactory;
      openaiFactory: OpenAIJobAnalysisChatAIServiceFactory;
      mockFactory: MockJobAnalysisChatAIServiceFactory;
      ollamaFactory: OllamaJobAnalysisChatAIServiceFactory;
    },
  ) {}

  create(
    config: Parameters<JobAnalysisChatAIServiceFactory["create"]>[0],
  ): JobAnalysisChatAIService {
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
