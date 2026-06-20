import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { ConversationCreatedEvent } from "../events/conversation-created.event";
import { ConversationRenamedEvent } from "../events/conversation-renamed.event";
import { ConversationDeletedEvent } from "../events/conversation-deleted.event";
import { CVChatConversationId } from "../value-objects/cv-chat-conversation-id.value-object";
import { CVChatTitle } from "../value-objects/cv-chat-title.value-object";
import {
  CVDocumentReference,
  type CVDocumentReferencePrimitives,
} from "../value-objects/cv-document-reference.value-object";

export interface ConversationPrimitives {
  id: string;
  userId: string;
  cvDocumentReference: CVDocumentReferencePrimitives;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationCreateParams {
  id: CVChatConversationId;
  userId: UserIdType;
  cvDocumentReference: CVDocumentReference;
  title: CVChatTitle;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class Conversation extends AggregateRoot {
  private constructor(
    private readonly conversationId: CVChatConversationId,
    private readonly ownerId: UserIdType,
    private readonly conversationCVDocumentReference: CVDocumentReference,
    private conversationTitle: CVChatTitle,
    private readonly conversationCreatedAt: Timestamp,
    private conversationUpdatedAt: Timestamp,
  ) {
    super();
  }

  static create(params: ConversationCreateParams): Conversation {
    const conversation = new Conversation(
      params.id,
      params.userId,
      params.cvDocumentReference,
      params.title,
      params.createdAt,
      params.updatedAt,
    );
    conversation.recordDomainEvent(new ConversationCreatedEvent(conversation.id));
    return conversation;
  }

  static fromPrimitives(primitives: ConversationPrimitives): Conversation {
    return new Conversation(
      CVChatConversationId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      CVDocumentReference.fromPrimitives(primitives.cvDocumentReference),
      CVChatTitle.fromPrimitives(primitives.title),
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt),
    );
  }

  get id(): string {
    return this.conversationId.toPrimitives();
  }

  get userId(): string {
    return this.ownerId.toPrimitives();
  }

  get idValue(): CVChatConversationId {
    return this.conversationId;
  }

  rename(title: CVChatTitle, updatedAt?: Timestamp): void {
    this.conversationTitle = title;
    if (updatedAt) this.conversationUpdatedAt = updatedAt;
    this.recordDomainEvent(new ConversationRenamedEvent(this.id));
  }

  delete(): void {
    this.recordDomainEvent(new ConversationDeletedEvent(this.id));
  }

  toPrimitives(): ConversationPrimitives {
    return {
      id: this.conversationId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      cvDocumentReference: this.conversationCVDocumentReference.toPrimitives(),
      title: this.conversationTitle.toPrimitives(),
      createdAt: this.conversationCreatedAt.toPrimitives(),
      updatedAt: this.conversationUpdatedAt.toPrimitives(),
    };
  }
}
