import type { Conversation } from "../../domain/entities/conversation.entity";
import type { ChatMessage } from "../../domain/entities/chat-message.entity";
import type { CVChatRolePrimitives } from "../../domain/value-objects/cv-chat-role.value-object";

export interface CVChatConversation {
  id: string;
  user_id: string;
  cv_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CVChatMessage {
  id: string;
  user_id: string;
  cv_id: string;
  conversation_id: string;
  role: CVChatRolePrimitives;
  content: string;
  model: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function legacyAnalysisId(
  reference: ReturnType<Conversation["toPrimitives"]>["cvDocumentReference"],
) {
  return reference.id;
}

export function presentConversation(
  conversation: Conversation,
): CVChatConversation {
  const primitives = conversation.toPrimitives();
  return {
    id: primitives.id,
    user_id: primitives.userId,
    cv_id: legacyAnalysisId(primitives.cvDocumentReference),
    title: primitives.title,
    created_at: primitives.createdAt,
    updated_at: primitives.updatedAt,
  };
}

export function presentConversations(
  conversations: Conversation[],
): CVChatConversation[] {
  return conversations.map(presentConversation);
}

export function presentMessage(message: ChatMessage): CVChatMessage {
  const primitives = message.toPrimitives();
  return {
    id: primitives.id,
    user_id: primitives.userId,
    cv_id: primitives.cvDocumentReference.id,
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
): CVChatMessage[] {
  return messages.map(presentMessage);
}
