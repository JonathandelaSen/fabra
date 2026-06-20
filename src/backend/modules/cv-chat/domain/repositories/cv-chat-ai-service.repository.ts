import type { ChatMessagePrimitives } from "../entities/chat-message.entity";
import type { AIProvider } from "@/backend/modules/shared";
import type { CVChatContext } from "../value-objects/cv-chat-context.value-object";
import type { CVChatContent } from "../value-objects/cv-chat-content.value-object";

export interface CVChatAIInput {
  message: string;
  context: CVChatContext;
  history: ChatMessagePrimitives[];
}

export interface CVChatAIService {
  generateAnswer(input: CVChatAIInput): Promise<CVChatContent>;
}

export interface CVChatAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): CVChatAIService;
}
