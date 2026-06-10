import { UserId, type EventBus } from "@/modules/shared";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { AnalysisChatConversationId } from "../../domain/value-objects/analysis-chat-conversation-id.value-object";

export interface DeleteConversationInput {
  userId: string;
  analysisId: string;
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
    const id = AnalysisChatConversationId.fromPrimitives(input.conversationId);
    const userId = UserId.fromPrimitives(input.userId);
    const conversation = await this.deps.conversationRepo.findById(id, userId);
    if (!conversation) throw new ConversationNotFoundError();

    conversation.delete();
    await this.deps.conversationRepo.delete(id, userId);

    const events = conversation.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
