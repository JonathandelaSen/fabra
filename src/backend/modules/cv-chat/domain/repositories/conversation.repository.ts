import type { UserId } from "@/backend/modules/shared";
import type { Conversation } from "../entities/conversation.entity";
import type { CVChatConversationId } from "../value-objects/cv-chat-conversation-id.value-object";
import type { CVDocumentReference } from "../value-objects/cv-document-reference.value-object";

export interface ConversationSearchCriteria {
  userId: UserId;
  cvDocumentReference: CVDocumentReference;
}

export interface ConversationRepository {
  search(criteria: ConversationSearchCriteria): Promise<Conversation[]>;
  findById(
    id: CVChatConversationId,
    userId: UserId,
  ): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<Conversation>;
  delete(id: CVChatConversationId, userId: UserId): Promise<void>;
}
