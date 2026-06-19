import type { UserId } from "@/modules/shared";
import type { ChatMessage } from "../entities/chat-message.entity";
import type { JobAnalysisChatMessageId } from "../value-objects/job-analysis-chat-message-id.value-object";
import type { JobAnalysisChatConversationId } from "../value-objects/job-analysis-chat-conversation-id.value-object";

export interface ChatMessageSearchCriteria {
  userId: UserId;
  conversationId: JobAnalysisChatConversationId;
}

export interface ChatMessageRepository {
  search(criteria: ChatMessageSearchCriteria): Promise<ChatMessage[]>;
  findById(
    id: JobAnalysisChatMessageId,
    userId: UserId,
  ): Promise<ChatMessage | null>;
  save(message: ChatMessage): Promise<ChatMessage>;
  delete(id: JobAnalysisChatMessageId, userId: UserId): Promise<void>;
}
