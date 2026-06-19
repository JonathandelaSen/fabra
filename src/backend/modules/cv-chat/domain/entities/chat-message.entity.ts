import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/modules/shared";
import { ChatMessageCreatedEvent } from "../events/chat-message-created.event";
import { CVChatContent } from "../value-objects/cv-chat-content.value-object";
import { CVChatConversationId } from "../value-objects/cv-chat-conversation-id.value-object";
import { CVChatMessageId } from "../value-objects/cv-chat-message-id.value-object";
import {
  CVChatRole,
  type CVChatRolePrimitives,
} from "../value-objects/cv-chat-role.value-object";
import {
  CVDocumentReference,
  type CVDocumentReferencePrimitives,
} from "../value-objects/cv-document-reference.value-object";

export interface ChatMessagePrimitives {
  id: string;
  userId: string;
  cvDocumentReference: CVDocumentReferencePrimitives;
  conversationId: string;
  role: CVChatRolePrimitives;
  content: string;
  model: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ChatMessageCreateParams {
  id: CVChatMessageId;
  userId: UserIdType;
  cvDocumentReference: CVDocumentReference;
  conversationId: CVChatConversationId;
  content: CVChatContent;
  createdAt: Timestamp;
}

export interface AssistantChatMessageCreateParams extends ChatMessageCreateParams {
  model: string | null;
  metadata: Record<string, unknown> | null;
}

export class ChatMessage extends AggregateRoot {
  private constructor(
    private readonly messageId: CVChatMessageId,
    private readonly ownerId: UserIdType,
    private readonly messageCVDocumentReference: CVDocumentReference,
    private readonly messageConversationId: CVChatConversationId,
    private readonly messageRole: CVChatRole,
    private readonly messageContent: CVChatContent,
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
      params.cvDocumentReference,
      params.conversationId,
      CVChatRole.user(),
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
      params.cvDocumentReference,
      params.conversationId,
      CVChatRole.assistant(),
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
      CVChatMessageId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      CVDocumentReference.fromPrimitives(primitives.cvDocumentReference),
      CVChatConversationId.fromPrimitives(primitives.conversationId),
      CVChatRole.fromPrimitives(primitives.role),
      CVChatContent.fromPrimitives(primitives.content),
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
      cvDocumentReference: this.messageCVDocumentReference.toPrimitives(),
      conversationId: this.conversationId,
      role: this.messageRole.toPrimitives(),
      content: this.messageContent.toPrimitives(),
      model: this.messageModel,
      metadata: this.messageMetadata ? { ...this.messageMetadata } : null,
      createdAt: this.messageCreatedAt.toPrimitives(),
    };
  }
}
