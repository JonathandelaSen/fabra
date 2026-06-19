import type {
  CVChatConversationMutationResponse,
  ListCVChatConversationsResponse,
  ListCVChatMessagesResponse,
  SendCVChatMessageResponse,
} from "@/app/api/cvs/[id]/chat/responses";

import type { StoredAIProvider } from "@/lib/browser-preferences";
import { parseJsonResponse as readJsonResponse } from "@/frontend/api/api-error";

export interface SendCVChatMessageInput {
  message: string;
  provider: StoredAIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  conversationId: string;
}

function chatUrl(cvId: string, conversationId?: string) {
  return `/api/cvs/${cvId}/chat${conversationId ? `/conversations/${encodeURIComponent(conversationId)}` : ""}`;
}

export async function listCVChatConversations(
  cvId: string,
  fallbackMessage: string,
) {
  const response = await fetch(chatUrl(cvId));
  return readJsonResponse<ListCVChatConversationsResponse>(
    response,
    fallbackMessage,
  );
}

export async function listCVChatMessages(
  cvId: string,
  conversationId: string,
  fallbackMessage: string,
) {
  const response = await fetch(`/api/cvs/${cvId}/chat/messages?conversationId=${encodeURIComponent(conversationId)}`);
  return readJsonResponse<ListCVChatMessagesResponse>(
    response,
    fallbackMessage,
  );
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
  return readJsonResponse<CVChatConversationMutationResponse>(
    response,
    fallbackMessage,
  );
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
  return readJsonResponse<CVChatConversationMutationResponse>(
    response,
    "Could not rename conversation",
  );
}

async function requestDeleteCVChatConversation(
  cvId: string,
  conversationId: string,
) {
  await fetch(chatUrl(cvId, conversationId), { method: "DELETE" });
}

export async function deleteCVChatConversation(
  cvId: string,
  conversationId: string,
) {
  await requestDeleteCVChatConversation(cvId, conversationId);
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
  return readJsonResponse<SendCVChatMessageResponse>(
    response,
    fallbackMessage,
  );
}

