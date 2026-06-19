import { OllamaCVChatAIServiceFactory } from "./infrastructure/services/ollama-cv-chat-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Telemetry, EventBus } from "@/modules/shared";
import { instrumentUseCases } from "@/modules/shared";
import { CreateConversationUseCase } from "./application/use-cases/create-conversation.use-case";
import { DeleteConversationUseCase } from "./application/use-cases/delete-conversation.use-case";
import { ListConversationsUseCase } from "./application/use-cases/list-conversations.use-case";
import { ListMessagesUseCase } from "./application/use-cases/list-messages.use-case";
import { RenameConversationUseCase } from "./application/use-cases/rename-conversation.use-case";
import { SendMessageUseCase } from "./application/use-cases/send-message.use-case";
import { GetCVChatContextUseCase } from "./application/use-cases/get-cv-chat-context.use-case";
import { CVChatContextRepository } from "./infrastructure/repositories/cv-chat-context.repository";
import { SupabaseCVChatMessageRepository } from "./infrastructure/repositories/supabase-chat-message.repository";
import { SupabaseCVChatConversationRepository } from "./infrastructure/repositories/supabase-conversation.repository";
import { GeminiCVChatAIServiceFactory } from "./infrastructure/services/gemini-cv-chat-ai.service";
import { MockCVChatAIServiceFactory } from "./infrastructure/services/mock-cv-chat-ai.service";
import { OpenAICVChatAIServiceFactory } from "./infrastructure/services/openai-cv-chat-ai.service";
import { ProviderCVChatAIServiceFactory } from "./infrastructure/services/provider-cv-chat-ai-service.factory";

const conversationRepo = new SupabaseCVChatConversationRepository();
const messageRepo = new SupabaseCVChatMessageRepository();
const aiFactory = new ProviderCVChatAIServiceFactory({
  geminiFactory: new GeminiCVChatAIServiceFactory(),
  openaiFactory: new OpenAICVChatAIServiceFactory(),
  mockFactory: new MockCVChatAIServiceFactory(),
  ollamaFactory: new OllamaCVChatAIServiceFactory(),
});

function createUseCases(
  contextReader: CVChatContextRepository,
  eventBus: EventBus,
) {
  return {
    listConversations: new ListConversationsUseCase({ conversationRepo }),
    createConversation: new CreateConversationUseCase({
      conversationRepo,
      eventBus,
    }),
    renameConversation: new RenameConversationUseCase({
      conversationRepo,
      eventBus,
    }),
    deleteConversation: new DeleteConversationUseCase({
      conversationRepo,
      eventBus,
    }),
    listMessages: new ListMessagesUseCase({ messageRepo }),
    getCVChatContext: new GetCVChatContextUseCase(contextReader),
    sendMessage: new SendMessageUseCase({
      conversationRepo,
      messageRepo,
      aiFactory,
      contextReader,
      eventBus,
    }),
  };
}

export type CVChatModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): CVChatModule;
};

export function createCVChatModule(
  telemetry: Telemetry,
  eventBus: EventBus,
): CVChatModule {
  const contextReader = new CVChatContextRepository();
  const useCases = instrumentUseCases(
    "cv-chat",
    createUseCases(contextReader, eventBus),
    telemetry,
  );

  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      conversationRepo.bindRequest(client);
      messageRepo.bindRequest(client);
      contextReader.bindRequest(client);
      return this;
    },
  };
}
