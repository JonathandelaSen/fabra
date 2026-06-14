import type { ChatRole } from "@/app/api/_shared/cv-chat/roles";

export interface CVChatConversationResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CVChatMessageResponse {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  model: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ListCVChatConversationsResponse {
  conversations: CVChatConversationResponse[];
}

export interface ListCVChatMessagesResponse {
  messages: CVChatMessageResponse[];
}

export interface CVChatConversationMutationResponse {
  conversation: CVChatConversationResponse;
}

export interface SendCVChatMessageResponse {
  userMessage: CVChatMessageResponse;
  assistantMessage: CVChatMessageResponse;
}
