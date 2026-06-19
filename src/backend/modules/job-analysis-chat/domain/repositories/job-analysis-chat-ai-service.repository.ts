import type { ChatMessagePrimitives } from "../entities/chat-message.entity";
import type { AIProvider } from "@/backend/modules/shared";
import type { JobAnalysisChatContext } from "../value-objects/job-analysis-chat-context.value-object";

export interface JobAnalysisChatAIInput {
  message: string;
  context: JobAnalysisChatContext;
  history: ChatMessagePrimitives[];
}

export interface JobAnalysisChatAIService {
  generateAnswer(input: JobAnalysisChatAIInput): Promise<string>;
}

export interface JobAnalysisChatAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): JobAnalysisChatAIService;
}
