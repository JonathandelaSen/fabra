import type {
  CVChatConversationMutationResponse,
  ListCVChatConversationsResponse,
  ListCVChatMessagesResponse,
  SendCVChatMessageResponse,
} from "@/app/api/cvs/[id]/chat/responses";

import type { StoredAIProvider } from "@/lib/browser-preferences";
import type { CVChatMessage } from "../components/detail/cv-chat-types";

interface ChatResponse {
  error?: string;
}

export interface SendCVChatMessageInput {
  message: string;
  provider: StoredAIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  conversationId: string;
}

async function readChatResponse<T extends ChatResponse>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T;
  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

function chatUrl(cvId: string, conversationId?: string) {
  return `/api/cvs/${cvId}/chat${conversationId ? `/conversations/${encodeURIComponent(conversationId)}` : ""}`;
}

function toChatMessage(
  message: SendCVChatMessageResponse["userMessage"],
): CVChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    created_at: message.createdAt,
  };
}

export async function listCVChatConversations(
  cvId: string,
  fallbackMessage: string,
) {
  const response = await fetch(chatUrl(cvId));
  const data = await readChatResponse<
    ListCVChatConversationsResponse & ChatResponse
  >(response, fallbackMessage);
  return data.conversations ?? [];
}

export async function listCVChatMessages(
  cvId: string,
  conversationId: string,
  fallbackMessage: string,
) {
  const response = await fetch(`/api/cvs/${cvId}/chat/messages?conversationId=${encodeURIComponent(conversationId)}`);
  const data = await readChatResponse<
    ListCVChatMessagesResponse & ChatResponse
  >(response, fallbackMessage);
  return (data.messages ?? []).map(toChatMessage);
}

export async function createCVChatConversation(
  cvId: string,
  fallbackMessage: string,
) {
  const response = await fetch(`${chatUrl(cvId)}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data = await readChatResponse<
    CVChatConversationMutationResponse & ChatResponse
  >(response, fallbackMessage);
  if (!data.conversation) {
    throw new Error(fallbackMessage);
  }
  return data.conversation;
}

export async function renameCVChatConversation(
  cvId: string,
  conversationId: string,
  title: string,
) {
  const response = await fetch(chatUrl(cvId, conversationId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
    }),
  });
  const data = await readChatResponse<
    CVChatConversationMutationResponse & ChatResponse
  >(response, "");
  if (!data.conversation) {
    throw new Error();
  }
  return data.conversation;
}

export async function deleteCVChatConversation(
  cvId: string,
  conversationId: string,
) {
  await fetch(chatUrl(cvId, conversationId), { method: "DELETE" });
}

export async function sendCVChatMessage(
  cvId: string,
  input: SendCVChatMessageInput,
  fallbackMessage: string,
) {
  const response = await fetch(`${chatUrl(cvId)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await readChatResponse<SendCVChatMessageResponse & ChatResponse>(
    response,
    fallbackMessage,
  );
  if (!data.userMessage || !data.assistantMessage) {
    throw new Error(fallbackMessage);
  }
  return {
    userMessage: toChatMessage(data.userMessage),
    assistantMessage: toChatMessage(data.assistantMessage),
  };
}
