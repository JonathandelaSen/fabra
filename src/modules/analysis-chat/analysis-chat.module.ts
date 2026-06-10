import { OllamaAnalysisChatAIServiceFactory } from "./infrastructure/services/ollama-analysis-chat-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventTracker, QueryBus, Telemetry, EventBus } from "@/modules/shared";
import { instrumentUseCases, SupabaseEventTracker } from "@/modules/shared";
import { GetAnalysisChatContextQueryHandler } from "./application/queries/get-analysis-chat-context.query-handler";
import { GetAnalysisChatContextQuery } from "./application/queries/get-analysis-chat-context.query";
import { CreateConversationUseCase } from "./application/use-cases/create-conversation.use-case";
import { DeleteConversationUseCase } from "./application/use-cases/delete-conversation.use-case";
import { GetAnalysisChatContextUseCase } from "./application/use-cases/get-analysis-chat-context.use-case";
import { ListConversationsUseCase } from "./application/use-cases/list-conversations.use-case";
import { ListMessagesUseCase } from "./application/use-cases/list-messages.use-case";
import { ApplyOfferChatCopyPasteUseCase } from "./application/use-cases/apply-offer-chat-copy-paste.use-case";
import { PrepareOfferChatCopyPasteUseCase } from "./application/use-cases/prepare-offer-chat-copy-paste.use-case";
import { RenameConversationUseCase } from "./application/use-cases/rename-conversation.use-case";
import { SendMessageUseCase } from "./application/use-cases/send-message.use-case";
import { AnalysisChatContextRepository } from "./infrastructure/repositories/analysis-chat-context.repository";
import { SupabaseChatMessageRepository } from "./infrastructure/repositories/supabase-chat-message.repository";
import { SupabaseConversationRepository } from "./infrastructure/repositories/supabase-conversation.repository";
import { GeminiAnalysisChatAIServiceFactory } from "./infrastructure/services/gemini-analysis-chat-ai.service";
import { MockAnalysisChatAIServiceFactory } from "./infrastructure/services/mock-analysis-chat-ai.service";
import { OpenAIAnalysisChatAIServiceFactory } from "./infrastructure/services/openai-analysis-chat-ai.service";
import { ProviderAnalysisChatAIServiceFactory } from "./infrastructure/services/provider-analysis-chat-ai-service.factory";

const conversationRepo = new SupabaseConversationRepository();
const messageRepo = new SupabaseChatMessageRepository();
const aiFactory = new ProviderAnalysisChatAIServiceFactory({
  geminiFactory: new GeminiAnalysisChatAIServiceFactory(),
  openaiFactory: new OpenAIAnalysisChatAIServiceFactory(),
  mockFactory: new MockAnalysisChatAIServiceFactory(),
  ollamaFactory: new OllamaAnalysisChatAIServiceFactory(),
});
const tracker: EventTracker = new SupabaseEventTracker();

function createUseCases(
  queryBus: QueryBus,
  contextReader: AnalysisChatContextRepository,
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
    sendMessage: new SendMessageUseCase({
      conversationRepo,
      messageRepo,
      aiFactory,
      queryBus,
      eventBus,
    }),
    prepareOfferChatCopyPaste: new PrepareOfferChatCopyPasteUseCase({
      conversationRepo,
      messageRepo,
      queryBus,
      tracker,
    }),
    applyOfferChatCopyPaste: new ApplyOfferChatCopyPasteUseCase({
      conversationRepo,
      messageRepo,
      eventBus,
    }),
    getAnalysisChatContext: new GetAnalysisChatContextUseCase({
      contextReader,
    }),
  };
}

export type AnalysisChatModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): AnalysisChatModule;
};

export function createAnalysisChatModule(
  queryBus: QueryBus,
  telemetry: Telemetry,
  eventBus: EventBus,
): AnalysisChatModule {
  const contextReader = new AnalysisChatContextRepository(queryBus);
  const useCases = instrumentUseCases(
    "analysis-chat",
    createUseCases(queryBus, contextReader, eventBus),
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

export function registerAnalysisChatQueries(
  queryBus: QueryBus & {
    register: (
      queryName: string,
      handler: GetAnalysisChatContextQueryHandler,
    ) => void;
  },
  module: AnalysisChatModule,
) {
  queryBus.register(
    GetAnalysisChatContextQuery.queryName,
    new GetAnalysisChatContextQueryHandler(module.getAnalysisChatContext),
  );
}
