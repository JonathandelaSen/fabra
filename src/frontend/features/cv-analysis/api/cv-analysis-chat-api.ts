import { CHAT_ACTIONS } from "@/app/api/_shared/job-analysis-chat/actions";
import type {
  DeleteOfferChatConversationResponse,
  ListOfferChatConversationsResponse,
  ListOfferChatMessagesResponse,
  OfferChatConversationMutationResponse,
  SendOfferChatMessageResponse,
} from "@/app/api/job-match-analyses/[id]/chat/responses";

import type { StoredAIProvider } from "@/lib/browser-preferences";

export interface SendAnalysisChatMessageInput {
  message: string;
  provider: StoredAIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  conversationId: string;
}

async function readJsonResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

function chatUrl(analysisId: string, conversationId?: string) {
  const params = conversationId
    ? `?conversationId=${encodeURIComponent(conversationId)}`
    : "";
  return `/api/job-match-analyses/${analysisId}/chat${params}`;
}

export async function listAnalysisChatConversations(
  analysisId: string,
  fallbackMessage: string,
) {
  const response = await fetch(chatUrl(analysisId));
  return readJsonResponse<ListOfferChatConversationsResponse>(
    response,
    fallbackMessage,
  );
}

export async function listAnalysisChatMessages(
  analysisId: string,
  conversationId: string,
  fallbackMessage: string,
) {
  const response = await fetch(chatUrl(analysisId, conversationId));
  return readJsonResponse<ListOfferChatMessagesResponse>(
    response,
    fallbackMessage,
  );
}

export async function createAnalysisChatConversation(
  analysisId: string,
  fallbackMessage: string,
) {
  const response = await fetch(chatUrl(analysisId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: CHAT_ACTIONS.createConversation }),
  });
  return readJsonResponse<OfferChatConversationMutationResponse>(
    response,
    fallbackMessage,
  );
}

export async function renameAnalysisChatConversation(
  analysisId: string,
  conversationId: string,
  title: string,
) {
  const response = await fetch(chatUrl(analysisId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: CHAT_ACTIONS.renameConversation,
      conversationId,
      title,
    }),
  });
  return readJsonResponse<OfferChatConversationMutationResponse>(response, "");
}

export async function deleteAnalysisChatConversation(
  analysisId: string,
  conversationId: string,
) {
  const response = await fetch(chatUrl(analysisId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: CHAT_ACTIONS.deleteConversation,
      conversationId,
    }),
  });
  return readJsonResponse<DeleteOfferChatConversationResponse>(response, "");
}

export async function sendAnalysisChatMessage(
  analysisId: string,
  input: SendAnalysisChatMessageInput,
  fallbackMessage: string,
) {
  const response = await fetch(chatUrl(analysisId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<SendOfferChatMessageResponse>(
    response,
    fallbackMessage,
  );
}
