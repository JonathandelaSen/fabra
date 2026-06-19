import {
  AIEntityType, AIModule, AIOperation, createIntegratedAIInteractionContext,
  publishAIInteractionApplied, runTrackedAIInteraction, serializeAIInteractionPrompt,
  Timestamp,
  UserId,
  type AIProvider,
  type EventBus,
} from "@/backend/modules/shared";
import { AnalysisContextNotFoundError } from "../../domain/errors/analysis-context-not-found.error";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import { ChatMessage } from "../../domain/entities/chat-message.entity";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import type { CVChatAIServiceFactory } from "../../domain/repositories/cv-chat-ai-service.repository";
import type { CVChatContext } from "../../domain/value-objects/cv-chat-context.value-object";
import type { CVChatContextReader } from "../../domain/repositories/cv-chat-context.repository";
import { CVChatContent } from "../../domain/value-objects/cv-chat-content.value-object";
import { CVChatConversationId } from "../../domain/value-objects/cv-chat-conversation-id.value-object";
import { CVChatMessageId } from "../../domain/value-objects/cv-chat-message-id.value-object";
import { CVDocumentReference } from "../../domain/value-objects/cv-document-reference.value-object";

export interface SendMessageInput {
  userId: string;
  cvId: string;
  conversationId: string;
  message: string;
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  requestId: string;
  startedAt?: number;
}

import { CVChatMessagePair } from "../../domain/value-objects/cv-chat-message-pair.value-object";

export class SendMessageUseCase {
  constructor(
    private readonly deps: {
      conversationRepo: ConversationRepository;
      messageRepo: ChatMessageRepository;
      aiFactory: CVChatAIServiceFactory;
      contextReader: CVChatContextReader;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: SendMessageInput): Promise<CVChatMessagePair> {
    const ownerId = UserId.fromPrimitives(input.userId);
    const conversationId = CVChatConversationId.fromPrimitives(
      input.conversationId,
    );
    const conversation = await this.deps.conversationRepo.findById(
      conversationId,
      ownerId,
    );
    if (!conversation) throw new ConversationNotFoundError();
    const conversationReference = conversation.toPrimitives().cvDocumentReference;
    if (
      conversationReference.id !== input.cvId
    ) {
      throw new ConversationNotFoundError();
    }

    const context: CVChatContext | null = await this.deps.contextReader.findByCVId({
      cvId: input.cvId,
      userId: input.userId,
    });
    if (!context) throw new AnalysisContextNotFoundError();

    const history = await this.deps.messageRepo.search({
      userId: ownerId,
      conversationId,
    });
    const cvDocumentReference = CVDocumentReference.fromPrimitives({ id: input.cvId });
    const now = new Date().toISOString();
    const userMessage = await this.deps.messageRepo.save(
      ChatMessage.createUserMessage({
        id: CVChatMessageId.fromPrimitives(crypto.randomUUID()),
        userId: ownerId,
        cvDocumentReference,
        conversationId,
        content: CVChatContent.fromPrimitives(input.message),
        createdAt: Timestamp.fromPrimitives(now),
      }),
    );

    const userEvents = userMessage.pullDomainEvents();
    await this.deps.eventBus.publish(userEvents);

    const interactionContext = createIntegratedAIInteractionContext({
      requestId: input.requestId, userId: input.userId, module: AIModule.CVChat,
      operation: AIOperation.GenerateChatAnswer, entityType: AIEntityType.CVConversation,
      entityId: input.conversationId, provider: input.provider, model: input.model,
    });
    let answer: string;
    try {
      const aiService = this.deps.aiFactory.create({
        provider: input.provider,
        apiKey: input.apiKey,
        baseUrl: input.baseUrl,
        model: input.model,
      });
      const aiInput = {
        message: input.message,
        context,
        history: history.map((message) => message.toPrimitives()),
      };
      answer = await runTrackedAIInteraction({
        eventBus: this.deps.eventBus, context: interactionContext,
        prompt: serializeAIInteractionPrompt(aiInput),
        execute: () => aiService.generateAnswer(aiInput),
      });
    } catch (error) {
      throw error;
    }

    const assistantMessage = await this.deps.messageRepo.save(
      ChatMessage.createAssistantMessage({
        id: CVChatMessageId.fromPrimitives(crypto.randomUUID()),
        userId: ownerId,
        cvDocumentReference,
        conversationId,
        content: CVChatContent.fromPrimitives(answer),
        model: input.model,
        metadata: { requestId: input.requestId },
        createdAt: Timestamp.fromPrimitives(new Date().toISOString()),
      }),
    );

    const assistantEvents = assistantMessage.pullDomainEvents();
    await this.deps.eventBus.publish(assistantEvents);
    await publishAIInteractionApplied(this.deps.eventBus, interactionContext);

    return CVChatMessagePair.create(userMessage, assistantMessage);
  }
}
