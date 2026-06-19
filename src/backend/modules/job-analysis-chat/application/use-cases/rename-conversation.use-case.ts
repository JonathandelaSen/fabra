import { Timestamp, UserId, type EventBus } from "@/modules/shared";
import { ConversationNotFoundError } from "../../domain/errors/conversation-not-found.error";
import type { Conversation } from "../../domain/entities/conversation.entity";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { JobAnalysisChatConversationId } from "../../domain/value-objects/job-analysis-chat-conversation-id.value-object";
import { JobAnalysisChatTitle } from "../../domain/value-objects/job-analysis-chat-title.value-object";

export interface RenameConversationInput {
  userId: string;
  analysisId: string;
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
    const id = JobAnalysisChatConversationId.fromPrimitives(input.conversationId);
    const userId = UserId.fromPrimitives(input.userId);
    const conversation = await this.deps.conversationRepo.findById(id, userId);
    if (!conversation) throw new ConversationNotFoundError();

    conversation.rename(
      JobAnalysisChatTitle.fromPrimitives(input.title),
      Timestamp.fromPrimitives(new Date().toISOString()),
    );
    const saved = await this.deps.conversationRepo.save(conversation);

    const events = conversation.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
