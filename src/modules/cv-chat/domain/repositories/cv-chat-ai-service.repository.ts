import type { ChatMessagePrimitives } from "../entities/chat-message.entity";
import type { AIProvider } from "@/modules/shared";
import type { CVChatContext } from "../value-objects/cv-chat-context.value-object";

export interface CVChatAIInput {
  message: string;
  context: CVChatContext;
  history: ChatMessagePrimitives[];
}

export interface CVChatAIService {
  generateAnswer(input: CVChatAIInput): Promise<string>;
}

export interface CVChatAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): CVChatAIService;
}
