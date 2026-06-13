import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/modules/shared";
import { ConversationCreatedEvent } from "../events/conversation-created.event";
import { ConversationRenamedEvent } from "../events/conversation-renamed.event";
import { ConversationDeletedEvent } from "../events/conversation-deleted.event";
import { JobAnalysisChatConversationId } from "../value-objects/job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatTitle } from "../value-objects/job-analysis-chat-title.value-object";
import {
  AnalysisReference,
  type AnalysisReferencePrimitives,
} from "../value-objects/analysis-reference.value-object";

export interface ConversationPrimitives {
  id: string;
  userId: string;
  analysisReference: AnalysisReferencePrimitives;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationCreateParams {
  id: JobAnalysisChatConversationId;
  userId: UserIdType;
  analysisReference: AnalysisReference;
  title: JobAnalysisChatTitle;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class Conversation extends AggregateRoot {
  private constructor(
    private readonly conversationId: JobAnalysisChatConversationId,
    private readonly ownerId: UserIdType,
    private readonly conversationAnalysisReference: AnalysisReference,
    private conversationTitle: JobAnalysisChatTitle,
    private readonly conversationCreatedAt: Timestamp,
    private conversationUpdatedAt: Timestamp,
  ) {
    super();
  }

  static create(params: ConversationCreateParams): Conversation {
    const conversation = new Conversation(
      params.id,
      params.userId,
      params.analysisReference,
      params.title,
      params.createdAt,
      params.updatedAt,
    );
    conversation.recordDomainEvent(new ConversationCreatedEvent(conversation.id));
    return conversation;
  }

  static fromPrimitives(primitives: ConversationPrimitives): Conversation {
    return new Conversation(
      JobAnalysisChatConversationId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      AnalysisReference.fromPrimitives(primitives.analysisReference),
      JobAnalysisChatTitle.fromPrimitives(primitives.title),
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

  get idValue(): JobAnalysisChatConversationId {
    return this.conversationId;
  }

  rename(title: JobAnalysisChatTitle, updatedAt?: Timestamp): void {
    this.conversationTitle = title;
    if (updatedAt) this.conversationUpdatedAt = updatedAt;
    this.recordDomainEvent(new ConversationRenamedEvent(this.id));
  }

  delete(): void {
    this.recordDomainEvent(new ConversationDeletedEvent(this.id));
  }

  toPrimitives(): ConversationPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      analysisReference: this.conversationAnalysisReference.toPrimitives(),
      title: this.conversationTitle.toPrimitives(),
      createdAt: this.conversationCreatedAt.toPrimitives(),
      updatedAt: this.conversationUpdatedAt.toPrimitives(),
    };
  }
}
