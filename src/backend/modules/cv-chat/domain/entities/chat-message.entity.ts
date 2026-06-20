import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { ChatMessageCreatedEvent } from "../events/chat-message-created.event";
import { CVChatContent } from "../value-objects/cv-chat-content.value-object";
import { CVChatConversationId } from "../value-objects/cv-chat-conversation-id.value-object";
import { CVChatMessageId } from "../value-objects/cv-chat-message-id.value-object";
import { CVChatMetadata } from "../value-objects/cv-chat-metadata.value-object";
import { CVChatModel } from "../value-objects/cv-chat-model.value-object";
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
    private readonly messageModel: CVChatModel,
    private readonly messageMetadata: CVChatMetadata,
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
      CVChatModel.fromPrimitives(null),
      CVChatMetadata.fromPrimitives(null),
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
      CVChatModel.fromPrimitives(params.model),
      CVChatMetadata.fromPrimitives(params.metadata),
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
      CVChatModel.fromPrimitives(primitives.model),
      CVChatMetadata.fromPrimitives(primitives.metadata),
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
      id: this.messageId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      cvDocumentReference: this.messageCVDocumentReference.toPrimitives(),
      conversationId: this.messageConversationId.toPrimitives(),
      role: this.messageRole.toPrimitives(),
      content: this.messageContent.toPrimitives(),
      model: this.messageModel.toPrimitives(),
      metadata: this.messageMetadata.toPrimitives(),
      createdAt: this.messageCreatedAt.toPrimitives(),
    };
  }
}
