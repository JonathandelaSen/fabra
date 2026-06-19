import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { ASSISTANCE_MODE } from "@/backend/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import { ChatMessage } from "../../domain/entities/chat-message.entity";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { JobAnalysisChatContent } from "../../domain/value-objects/job-analysis-chat-content.value-object";
import { JobAnalysisChatConversationId } from "../../domain/value-objects/job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatMessageId } from "../../domain/value-objects/job-analysis-chat-message-id.value-object";
import { AnalysisReference } from "../../domain/value-objects/analysis-reference.value-object";
import { OfferChatMessagePair } from "../../domain/value-objects/offer-chat-message-pair.value-object";

export interface ApplyOfferChatCopyPasteInput {
  userId: string;
  analysisId: string;
  conversationId: string;
  userMessage: string;
  assistantResponse: string;
  requestId: string;
  startedAt?: number;
}

export class ApplyOfferChatCopyPasteUseCase {
  constructor(
    private readonly deps: {
      conversationRepo: ConversationRepository;
      messageRepo: ChatMessageRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(
    input: ApplyOfferChatCopyPasteInput,
  ): Promise<OfferChatMessagePair> {
    const ownerId = UserId.fromPrimitives(input.userId);
    const conversationId = JobAnalysisChatConversationId.fromPrimitives(
      input.conversationId,
    );
    const conversation = await this.deps.conversationRepo.findById(
      conversationId,
      ownerId,
    );
    if (!conversation) throw new ConversationNotFoundError();

    const analysisReference = AnalysisReference.fromPrimitives({
      type: "job_match_analysis",
      id: input.analysisId,
    });
    const now = new Date().toISOString();
    const userMessage = await this.deps.messageRepo.save(
      ChatMessage.createUserMessage({
        id: JobAnalysisChatMessageId.fromPrimitives(crypto.randomUUID()),
        userId: ownerId,
        analysisReference,
        conversationId,
        content: JobAnalysisChatContent.fromPrimitives(input.userMessage),
        createdAt: Timestamp.fromPrimitives(now),
      }),
    );

    const userEvents = userMessage.pullDomainEvents();
    await this.deps.eventBus.publish(userEvents);

    const assistantMessage = await this.deps.messageRepo.save(
      ChatMessage.createAssistantMessage({
        id: JobAnalysisChatMessageId.fromPrimitives(crypto.randomUUID()),
        userId: ownerId,
        analysisReference,
        conversationId,
        content: JobAnalysisChatContent.fromPrimitives(input.assistantResponse),
        model: "external-chat",
        metadata: {
          requestId: input.requestId,
          assistanceMode: ASSISTANCE_MODE.copyPaste,
          source: "external-chat",
        },
        createdAt: Timestamp.fromPrimitives(new Date().toISOString()),
      }),
    );

    const assistantEvents = assistantMessage.pullDomainEvents();
    await this.deps.eventBus.publish(assistantEvents);

    return OfferChatMessagePair.create(userMessage, assistantMessage);
  }
}
