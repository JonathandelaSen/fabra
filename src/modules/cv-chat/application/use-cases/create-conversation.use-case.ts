import { Timestamp, UserId, type EventBus } from "@/modules/shared";
import { Conversation } from "../../domain/entities/conversation.entity";
import type { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { CVChatConversationId } from "../../domain/value-objects/cv-chat-conversation-id.value-object";
import { CVChatTitle } from "../../domain/value-objects/cv-chat-title.value-object";
import { CVDocumentReference } from "../../domain/value-objects/cv-document-reference.value-object";

export interface CreateConversationInput {
  userId: string;
  cvId: string;
  title?: string | null;
  requestId: string;
}

export class CreateConversationUseCase {
  constructor(
    private readonly deps: {
      conversationRepo: ConversationRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: CreateConversationInput): Promise<Conversation> {
    const now = new Date().toISOString();
    const conversation = await this.deps.conversationRepo.save(
      Conversation.create({
        id: CVChatConversationId.fromPrimitives(crypto.randomUUID()),
        userId: UserId.fromPrimitives(input.userId),
        cvDocumentReference: CVDocumentReference.fromPrimitives({ id: input.cvId }),
        title: CVChatTitle.fromPrimitives(
          input.title ?? "Nueva conversación",
        ),
        createdAt: Timestamp.fromPrimitives(now),
        updatedAt: Timestamp.fromPrimitives(now),
      }),
    );

    const events = conversation.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return conversation;
  }
}
