import { OllamaJobAnalysisChatAIServiceFactory } from "./infrastructure/services/ollama-job-analysis-chat-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { QueryBus, Telemetry, EventBus } from "@/modules/shared";
import { instrumentUseCases } from "@/modules/shared";
import { GetJobAnalysisChatContextQueryHandler } from "./application/queries/get-job-analysis-chat-context.query-handler";
import { GetJobAnalysisChatContextQuery } from "./application/queries/get-job-analysis-chat-context.query";
import { CreateConversationUseCase } from "./application/use-cases/create-conversation.use-case";
import { DeleteConversationUseCase } from "./application/use-cases/delete-conversation.use-case";
import { GetJobAnalysisChatContextUseCase } from "./application/use-cases/get-job-analysis-chat-context.use-case";
import { ListConversationsUseCase } from "./application/use-cases/list-conversations.use-case";
import { ListMessagesUseCase } from "./application/use-cases/list-messages.use-case";
import { ApplyOfferChatCopyPasteUseCase } from "./application/use-cases/apply-offer-chat-copy-paste.use-case";
import { PrepareOfferChatCopyPasteUseCase } from "./application/use-cases/prepare-offer-chat-copy-paste.use-case";
import { RenameConversationUseCase } from "./application/use-cases/rename-conversation.use-case";
import { SendMessageUseCase } from "./application/use-cases/send-message.use-case";
import { JobAnalysisChatContextRepository } from "./infrastructure/repositories/job-analysis-chat-context.repository";
import { SupabaseChatMessageRepository } from "./infrastructure/repositories/supabase-chat-message.repository";
import { SupabaseConversationRepository } from "./infrastructure/repositories/supabase-conversation.repository";
import { GeminiJobAnalysisChatAIServiceFactory } from "./infrastructure/services/gemini-job-analysis-chat-ai.service";
import { MockJobAnalysisChatAIServiceFactory } from "./infrastructure/services/mock-job-analysis-chat-ai.service";
import { OpenAIJobAnalysisChatAIServiceFactory } from "./infrastructure/services/openai-job-analysis-chat-ai.service";
import { ProviderJobAnalysisChatAIServiceFactory } from "./infrastructure/services/provider-job-analysis-chat-ai-service.factory";

const conversationRepo = new SupabaseConversationRepository();
const messageRepo = new SupabaseChatMessageRepository();
const aiFactory = new ProviderJobAnalysisChatAIServiceFactory({
  geminiFactory: new GeminiJobAnalysisChatAIServiceFactory(),
  openaiFactory: new OpenAIJobAnalysisChatAIServiceFactory(),
  mockFactory: new MockJobAnalysisChatAIServiceFactory(),
  ollamaFactory: new OllamaJobAnalysisChatAIServiceFactory(),
});

function createUseCases(
  queryBus: QueryBus,
  contextReader: JobAnalysisChatContextRepository,
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
    }),
    applyOfferChatCopyPaste: new ApplyOfferChatCopyPasteUseCase({
      conversationRepo,
      messageRepo,
      eventBus,
    }),
    getJobAnalysisChatContext: new GetJobAnalysisChatContextUseCase({
      contextReader,
    }),
  };
}

export type JobAnalysisChatModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): JobAnalysisChatModule;
};

export function createJobAnalysisChatModule(
  queryBus: QueryBus,
  telemetry: Telemetry,
  eventBus: EventBus,
): JobAnalysisChatModule {
  const contextReader = new JobAnalysisChatContextRepository(queryBus);
  const useCases = instrumentUseCases(
    "job-analysis-chat",
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

export function registerJobAnalysisChatQueries(
  queryBus: QueryBus & {
    register: (
      queryName: string,
      handler: GetJobAnalysisChatContextQueryHandler,
    ) => void;
  },
  module: JobAnalysisChatModule,
) {
  queryBus.register(
    GetJobAnalysisChatContextQuery.queryName,
    new GetJobAnalysisChatContextQueryHandler(module.getJobAnalysisChatContext),
  );
}
