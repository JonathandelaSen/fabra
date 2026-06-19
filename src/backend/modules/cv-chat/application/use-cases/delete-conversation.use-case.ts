import { UserId, type EventBus } from "@/backend/modules/shared";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { CVChatConversationId } from "../../domain/value-objects/cv-chat-conversation-id.value-object";

export interface DeleteConversationInput {
  userId: string;
  cvId: string;
  conversationId: string;
  requestId: string;
}

export class DeleteConversationUseCase {
  constructor(
    private readonly deps: {
      conversationRepo: ConversationRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: DeleteConversationInput): Promise<void> {
    const id = CVChatConversationId.fromPrimitives(input.conversationId);
    const userId = UserId.fromPrimitives(input.userId);
    const conversation = await this.deps.conversationRepo.findById(id, userId);
    if (!conversation) throw new ConversationNotFoundError();
    const reference = conversation.toPrimitives().cvDocumentReference;
    if (reference.id !== input.cvId) throw new ConversationNotFoundError();

    conversation.delete();
    await this.deps.conversationRepo.delete(id, userId);

    const events = conversation.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
