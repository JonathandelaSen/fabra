import { UserId } from "@/backend/modules/shared";
import type { ChatMessage } from "../../domain/entities/chat-message.entity";
import type { ChatMessageRepository } from "../../domain/repositories/chat-message.repository";
import { CVChatConversationId } from "../../domain/value-objects/cv-chat-conversation-id.value-object";
import { CVDocumentReference } from "../../domain/value-objects/cv-document-reference.value-object";

export interface ListMessagesInput {
  userId: string;
  conversationId: string;
  cvId?: string;
}

export class ListMessagesUseCase {
  constructor(private readonly deps: { messageRepo: ChatMessageRepository }) {}

  async execute(input: ListMessagesInput): Promise<ChatMessage[]> {
    return this.deps.messageRepo.search({
      userId: UserId.fromPrimitives(input.userId),
      conversationId: CVChatConversationId.fromPrimitives(
        input.conversationId,
      ),
      cvDocumentReference: input.cvId
        ? CVDocumentReference.fromPrimitives({
            id: input.cvId,
          })
        : undefined,
    });
  }
}
