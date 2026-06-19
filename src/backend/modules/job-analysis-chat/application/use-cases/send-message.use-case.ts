import {
  AIEntityType, AIModule, AIOperation, createIntegratedAIInteractionContext,
  publishAIInteractionApplied, runTrackedAIInteraction, serializeAIInteractionPrompt,
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
import type { JobAnalysisChatAIServiceFactory } from "../../domain/repositories/job-analysis-chat-ai-service.repository";
import type { JobAnalysisChatContext } from "../../domain/value-objects/job-analysis-chat-context.value-object";
import { JobAnalysisChatContent } from "../../domain/value-objects/job-analysis-chat-content.value-object";
import { JobAnalysisChatConversationId } from "../../domain/value-objects/job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatMessageId } from "../../domain/value-objects/job-analysis-chat-message-id.value-object";
import { AnalysisReference } from "../../domain/value-objects/analysis-reference.value-object";
import { GetJobAnalysisChatContextQuery } from "../queries/get-job-analysis-chat-context.query";
import { JobAnalysisChatExchange } from "../../domain/value-objects/job-analysis-chat-exchange.value-object";

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

export class SendMessageUseCase {
  constructor(
    private readonly deps: {
      conversationRepo: ConversationRepository;
      messageRepo: ChatMessageRepository;
      aiFactory: JobAnalysisChatAIServiceFactory;
      queryBus: QueryBus;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: SendMessageInput): Promise<JobAnalysisChatExchange> {
    const ownerId = UserId.fromPrimitives(input.userId);
    const conversationId = JobAnalysisChatConversationId.fromPrimitives(
      input.conversationId,
    );
    const conversation = await this.deps.conversationRepo.findById(
      conversationId,
      ownerId,
    );
    if (!conversation) throw new ConversationNotFoundError();

    const context =
      await this.deps.queryBus.execute<JobAnalysisChatContext | null>(
        new GetJobAnalysisChatContextQuery({
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
        id: JobAnalysisChatMessageId.fromPrimitives(crypto.randomUUID()),
        userId: ownerId,
        analysisReference,
        conversationId,
        content: JobAnalysisChatContent.fromPrimitives(input.message),
        createdAt: Timestamp.fromPrimitives(now),
      }),
    );

    const userEvents = userMessage.pullDomainEvents();
    await this.deps.eventBus.publish(userEvents);

    const interactionContext = createIntegratedAIInteractionContext({
      requestId: input.requestId, userId: input.userId, module: AIModule.JobAnalysisChat,
      operation: AIOperation.GenerateChatAnswer, entityType: AIEntityType.AnalysisConversation,
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
        id: JobAnalysisChatMessageId.fromPrimitives(crypto.randomUUID()),
        userId: ownerId,
        analysisReference,
        conversationId,
        content: JobAnalysisChatContent.fromPrimitives(answer),
        model: input.model,
        metadata: { requestId: input.requestId },
        createdAt: Timestamp.fromPrimitives(new Date().toISOString()),
      }),
    );

    const assistantEvents = assistantMessage.pullDomainEvents();
    await this.deps.eventBus.publish(assistantEvents);
    await publishAIInteractionApplied(this.deps.eventBus, interactionContext);

    return JobAnalysisChatExchange.create(userMessage, assistantMessage);
  }
}
