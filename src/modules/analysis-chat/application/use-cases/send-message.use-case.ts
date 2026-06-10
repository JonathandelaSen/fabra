import {
  Timestamp,
  UserId,
  type AIProvider,
  type QueryBus,
  type EventBus,
} from "@/modules/shared";
import { AnalysisContextNotFoundError } from "../../domain/errors/analysis-context-not-found.error";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import { ChatMessage } from "../../domain/entities/chat-message.entity";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import type { AnalysisChatAIServiceFactory } from "../../domain/repositories/analysis-chat-ai-service.repository";
import type { AnalysisChatContext } from "../../domain/value-objects/analysis-chat-context.value-object";
import { AnalysisChatContent } from "../../domain/value-objects/analysis-chat-content.value-object";
import { AnalysisChatConversationId } from "../../domain/value-objects/analysis-chat-conversation-id.value-object";
import { AnalysisChatMessageId } from "../../domain/value-objects/analysis-chat-message-id.value-object";
import { AnalysisReference } from "../../domain/value-objects/analysis-reference.value-object";
import { GetAnalysisChatContextQuery } from "../queries/get-analysis-chat-context.query";

export interface SendMessageInput {
  userId: string;
  analysisId: string;
  conversationId: string;
  message: string;
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  requestId: string;
  startedAt?: number;
}

export interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export class SendMessageUseCase {
  constructor(
    private readonly deps: {
      conversationRepo: ConversationRepository;
      messageRepo: ChatMessageRepository;
      aiFactory: AnalysisChatAIServiceFactory;
      queryBus: QueryBus;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageResult> {
    const ownerId = UserId.fromPrimitives(input.userId);
    const conversationId = AnalysisChatConversationId.fromPrimitives(
      input.conversationId,
    );
    const conversation = await this.deps.conversationRepo.findById(
      conversationId,
      ownerId,
    );
    if (!conversation) throw new ConversationNotFoundError();

    const context =
      await this.deps.queryBus.execute<AnalysisChatContext | null>(
        new GetAnalysisChatContextQuery({
          analysisId: input.analysisId,
          userId: input.userId,
        }),
      );
    if (!context) throw new AnalysisContextNotFoundError();

    const history = await this.deps.messageRepo.search({
      userId: ownerId,
      conversationId,
    });
    const analysisReference = AnalysisReference.fromPrimitives({
      type: "job_match_analysis",
      id: input.analysisId,
    });
    const now = new Date().toISOString();
    const userMessage = await this.deps.messageRepo.save(
      ChatMessage.createUserMessage({
        id: AnalysisChatMessageId.fromPrimitives(crypto.randomUUID()),
        userId: ownerId,
        analysisReference,
        conversationId,
        content: AnalysisChatContent.fromPrimitives(input.message),
        createdAt: Timestamp.fromPrimitives(now),
      }),
    );

    const userEvents = userMessage.pullDomainEvents();
    await this.deps.eventBus.publish(userEvents);

    let answer: string;
    try {
      const aiService = this.deps.aiFactory.create({
        provider: input.provider,
        apiKey: input.apiKey,
        baseUrl: input.baseUrl,
        model: input.model,
      });
      answer = await aiService.generateAnswer({
        message: input.message,
        context,
        history: history.map((message) => message.toPrimitives()),
      });
    } catch (error) {
      throw error;
    }

    const assistantMessage = await this.deps.messageRepo.save(
      ChatMessage.createAssistantMessage({
        id: AnalysisChatMessageId.fromPrimitives(crypto.randomUUID()),
        userId: ownerId,
        analysisReference,
        conversationId,
        content: AnalysisChatContent.fromPrimitives(answer),
        model: input.model,
        metadata: { requestId: input.requestId },
        createdAt: Timestamp.fromPrimitives(new Date().toISOString()),
      }),
    );

    const assistantEvents = assistantMessage.pullDomainEvents();
    await this.deps.eventBus.publish(assistantEvents);

    return { userMessage, assistantMessage };
  }
}
