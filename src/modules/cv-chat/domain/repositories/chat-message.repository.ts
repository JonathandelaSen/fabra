import type { UserId } from "@/modules/shared";
import type { ChatMessage } from "../entities/chat-message.entity";
import type { CVChatMessageId } from "../value-objects/cv-chat-message-id.value-object";
import type { CVChatConversationId } from "../value-objects/cv-chat-conversation-id.value-object";
import type { CVDocumentReference } from "../value-objects/cv-document-reference.value-object";

export interface ChatMessageSearchCriteria {
  userId: UserId;
  conversationId: CVChatConversationId;
  cvDocumentReference?: CVDocumentReference;
}

export interface ChatMessageRepository {
  search(criteria: ChatMessageSearchCriteria): Promise<ChatMessage[]>;
  findById(
    id: CVChatMessageId,
    userId: UserId,
  ): Promise<ChatMessage | null>;
  save(message: ChatMessage): Promise<ChatMessage>;
  delete(id: CVChatMessageId, userId: UserId): Promise<void>;
}
