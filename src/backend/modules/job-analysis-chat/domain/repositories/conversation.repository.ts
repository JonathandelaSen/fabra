import type { UserId } from "@/backend/modules/shared";
import type { Conversation } from "../entities/conversation.entity";
import type { JobAnalysisChatConversationId } from "../value-objects/job-analysis-chat-conversation-id.value-object";
import type { AnalysisReference } from "../value-objects/analysis-reference.value-object";

export interface ConversationSearchCriteria {
  userId: UserId;
  analysisReference: AnalysisReference;
}

export interface ConversationRepository {
  search(criteria: ConversationSearchCriteria): Promise<Conversation[]>;
  findById(
    id: JobAnalysisChatConversationId,
    userId: UserId,
  ): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<Conversation>;
  delete(id: JobAnalysisChatConversationId, userId: UserId): Promise<void>;
}
