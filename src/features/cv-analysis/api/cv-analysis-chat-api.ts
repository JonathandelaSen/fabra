import type {
  AnalysisChatConversation,
  AnalysisChatMessage,
} from "../components/chat-types";

import type { StoredAIProvider } from "@/lib/browser-preferences";

interface ChatResponse {
  error?: string;
}

interface ListConversationsResponse extends ChatResponse {
  conversations?: AnalysisChatConversation[];
}

interface ListMessagesResponse extends ChatResponse {
  messages?: AnalysisChatMessage[];
}

interface ConversationResponse extends ChatResponse {
  conversation?: AnalysisChatConversation;
}

interface SendMessageResponse extends ChatResponse {
  userMessage?: AnalysisChatMessage;
  assistantMessage?: AnalysisChatMessage;
}

export interface SendAnalysisChatMessageInput {
  message: string;
  provider: StoredAIProvider;
  apiKey: string;
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
  const data = await readChatResponse<ListConversationsResponse>(
    response,
    fallbackMessage,
  );
  return data.conversations ?? [];
}

export async function listAnalysisChatMessages(
  analysisId: string,
  conversationId: string,
  fallbackMessage: string,
) {
  const response = await fetch(chatUrl(analysisId, conversationId));
  const data = await readChatResponse<ListMessagesResponse>(
    response,
    fallbackMessage,
  );
  return data.messages ?? [];
}

export async function createAnalysisChatConversation(
  analysisId: string,
  fallbackMessage: string,
) {
  const response = await fetch(chatUrl(analysisId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create_conversation" }),
  });
  const data = await readChatResponse<ConversationResponse>(
    response,
    fallbackMessage,
  );
  if (!data.conversation) {
    throw new Error(fallbackMessage);
  }
  return data.conversation;
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
      action: "rename_conversation",
      conversationId,
      title,
    }),
  });
  const data = await readChatResponse<ConversationResponse>(response, "");
  if (!data.conversation) {
    throw new Error();
  }
  return data.conversation;
}

export async function deleteAnalysisChatConversation(
  analysisId: string,
  conversationId: string,
) {
  await fetch(chatUrl(analysisId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "delete_conversation",
      conversationId,
    }),
  });
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
  const data = await readChatResponse<SendMessageResponse>(
    response,
    fallbackMessage,
  );
  if (!data.userMessage || !data.assistantMessage) {
    throw new Error(fallbackMessage);
  }
  return {
    userMessage: data.userMessage,
    assistantMessage: data.assistantMessage,
  };
}
