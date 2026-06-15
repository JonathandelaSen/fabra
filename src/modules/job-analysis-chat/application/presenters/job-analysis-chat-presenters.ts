import type { Conversation } from "../../domain/entities/conversation.entity";
import type { ChatMessage } from "../../domain/entities/chat-message.entity";
import type { JobAnalysisChatRolePrimitives } from "../../domain/value-objects/job-analysis-chat-role.value-object";

export interface JobAnalysisChatConversation {
  id: string;
  user_id: string;
  analysis_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface JobAnalysisChatMessage {
  id: string;
  user_id: string;
  analysis_id: string;
  conversation_id: string;
  role: JobAnalysisChatRolePrimitives;
  content: string;
  model: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function legacyAnalysisId(
  reference: ReturnType<Conversation["toPrimitives"]>["analysisReference"],
) {
  return reference.id;
}

export function presentConversation(
  conversation: Conversation,
): JobAnalysisChatConversation {
  const primitives = conversation.toPrimitives();
  return {
    id: primitives.id,
    user_id: primitives.userId,
    analysis_id: legacyAnalysisId(primitives.analysisReference),
    title: primitives.title,
    created_at: primitives.createdAt,
    updated_at: primitives.updatedAt,
  };
}

export function presentConversations(
  conversations: Conversation[],
): JobAnalysisChatConversation[] {
  return conversations.map(presentConversation);
}

export function presentMessage(message: ChatMessage): JobAnalysisChatMessage {
  const primitives = message.toPrimitives();
  return {
    id: primitives.id,
    user_id: primitives.userId,
    analysis_id: primitives.analysisReference.id,
    conversation_id: primitives.conversationId,
    role: primitives.role,
    content: primitives.content,
    model: primitives.model,
    metadata: primitives.metadata,
    created_at: primitives.createdAt,
  };
}

export function presentMessages(
  messages: ChatMessage[],
): JobAnalysisChatMessage[] {
  return messages.map(presentMessage);
}
