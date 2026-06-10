import type { ChatMessagePrimitives } from "../entities/chat-message.entity";
import type { AIProvider } from "@/modules/shared";
import type { AnalysisChatContext } from "../value-objects/analysis-chat-context.value-object";

export interface AnalysisChatAIInput {
  message: string;
  context: AnalysisChatContext;
  history: ChatMessagePrimitives[];
}

export interface AnalysisChatAIService {
  generateAnswer(input: AnalysisChatAIInput): Promise<string>;
}

export interface AnalysisChatAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): AnalysisChatAIService;
}
