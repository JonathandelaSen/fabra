import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import type { Conversation } from "../../domain/entities/conversation.entity";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { CVChatConversationId } from "../../domain/value-objects/cv-chat-conversation-id.value-object";
import { CVChatTitle } from "../../domain/value-objects/cv-chat-title.value-object";

export interface RenameConversationInput {
  userId: string;
  cvId: string;
  conversationId: string;
  title: string;
  requestId: string;
}

export class RenameConversationUseCase {
  constructor(
    private readonly deps: {
      conversationRepo: ConversationRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: RenameConversationInput): Promise<Conversation> {
    const id = CVChatConversationId.fromPrimitives(input.conversationId);
    const userId = UserId.fromPrimitives(input.userId);
    const conversation = await this.deps.conversationRepo.findById(id, userId);
    if (!conversation) throw new ConversationNotFoundError();
    const reference = conversation.toPrimitives().cvDocumentReference;
    if (reference.id !== input.cvId) throw new ConversationNotFoundError();

    conversation.rename(
      CVChatTitle.fromPrimitives(input.title),
      Timestamp.fromPrimitives(new Date().toISOString()),
    );
    const saved = await this.deps.conversationRepo.save(conversation);

    const events = conversation.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
