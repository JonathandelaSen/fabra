import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { ChatMessageCreatedEvent } from "../events/chat-message-created.event";
import { JobAnalysisChatContent } from "../value-objects/job-analysis-chat-content.value-object";
import { JobAnalysisChatConversationId } from "../value-objects/job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatMessageId } from "../value-objects/job-analysis-chat-message-id.value-object";
import {
  JobAnalysisChatRole,
  type JobAnalysisChatRolePrimitives,
} from "../value-objects/job-analysis-chat-role.value-object";
import {
  AnalysisReference,
  type AnalysisReferencePrimitives,
} from "../value-objects/analysis-reference.value-object";

export interface ChatMessagePrimitives {
  id: string;
  userId: string;
  analysisReference: AnalysisReferencePrimitives;
  conversationId: string;
  role: JobAnalysisChatRolePrimitives;
  content: string;
  model: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ChatMessageCreateParams {
  id: JobAnalysisChatMessageId;
  userId: UserIdType;
  analysisReference: AnalysisReference;
  conversationId: JobAnalysisChatConversationId;
  content: JobAnalysisChatContent;
  createdAt: Timestamp;
}

export interface AssistantChatMessageCreateParams extends ChatMessageCreateParams {
  model: string | null;
  metadata: Record<string, unknown> | null;
}

export class ChatMessage extends AggregateRoot {
  private constructor(
    private readonly messageId: JobAnalysisChatMessageId,
    private readonly ownerId: UserIdType,
    private readonly messageAnalysisReference: AnalysisReference,
    private readonly messageConversationId: JobAnalysisChatConversationId,
    private readonly messageRole: JobAnalysisChatRole,
    private readonly messageContent: JobAnalysisChatContent,
    private readonly messageModel: string | null,
    private readonly messageMetadata: Record<string, unknown> | null,
    private readonly messageCreatedAt: Timestamp,
  ) {
    super();
  }

  static createUserMessage(params: ChatMessageCreateParams): ChatMessage {
    const message = new ChatMessage(
      params.id,
      params.userId,
      params.analysisReference,
      params.conversationId,
      JobAnalysisChatRole.user(),
      params.content,
      null,
      null,
      params.createdAt,
    );
    message.recordCreatedEvent();
    return message;
  }

  static createAssistantMessage(
    params: AssistantChatMessageCreateParams,
  ): ChatMessage {
    const message = new ChatMessage(
      params.id,
      params.userId,
      params.analysisReference,
      params.conversationId,
      JobAnalysisChatRole.assistant(),
      params.content,
      params.model,
      params.metadata,
      params.createdAt,
    );
    message.recordCreatedEvent();
    return message;
  }

  private recordCreatedEvent(): void {
    this.recordDomainEvent(
      new ChatMessageCreatedEvent(this.id, this.conversationId, this.messageRole.toPrimitives()),
    );
  }

  static fromPrimitives(primitives: ChatMessagePrimitives): ChatMessage {
    return new ChatMessage(
      JobAnalysisChatMessageId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      AnalysisReference.fromPrimitives(primitives.analysisReference),
      JobAnalysisChatConversationId.fromPrimitives(primitives.conversationId),
      JobAnalysisChatRole.fromPrimitives(primitives.role),
      JobAnalysisChatContent.fromPrimitives(primitives.content),
      primitives.model,
      primitives.metadata,
      Timestamp.fromPrimitives(primitives.createdAt),
    );
  }

  get id(): string {
    return this.messageId.toPrimitives();
  }

  get userId(): string {
    return this.ownerId.toPrimitives();
  }

  get conversationId(): string {
    return this.messageConversationId.toPrimitives();
  }

  toPrimitives(): ChatMessagePrimitives {
    return {
      id: this.id,
      userId: this.userId,
      analysisReference: this.messageAnalysisReference.toPrimitives(),
      conversationId: this.conversationId,
      role: this.messageRole.toPrimitives(),
      content: this.messageContent.toPrimitives(),
      model: this.messageModel,
      metadata: this.messageMetadata ? { ...this.messageMetadata } : null,
      createdAt: this.messageCreatedAt.toPrimitives(),
    };
  }
}
