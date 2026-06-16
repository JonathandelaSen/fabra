import {
  presentConversation,
  presentConversations,
  presentMessage,
  presentMessages,
  type JobAnalysisChatConversation,
  type JobAnalysisChatMessage,
  type Conversation,
  type ChatMessage,
} from "@/modules/job-analysis-chat";

export type {
  JobAnalysisChatConversation,
  JobAnalysisChatMessage,
} from "@/modules/job-analysis-chat";

export interface ListOfferChatConversationsResponse {
  conversations: JobAnalysisChatConversation[];
}

export interface ListOfferChatMessagesResponse {
  messages: JobAnalysisChatMessage[];
}

export interface OfferChatConversationMutationResponse {
  conversation: JobAnalysisChatConversation;
}

export interface DeleteOfferChatConversationResponse {
  ok: true;
}

export interface SendOfferChatMessageResponse {
  userMessage: JobAnalysisChatMessage;
  assistantMessage: JobAnalysisChatMessage;
}

export function toListOfferChatMessagesResponse(
  messages: ChatMessage[],
): ListOfferChatMessagesResponse {
  return { messages: presentMessages(messages) };
}

export function toListOfferChatConversationsResponse(
  conversations: Conversation[],
): ListOfferChatConversationsResponse {
  return { conversations: presentConversations(conversations) };
}

export function toOfferChatConversationMutationResponse(
  conversation: Conversation,
): OfferChatConversationMutationResponse {
  return { conversation: presentConversation(conversation) };
}

export function toDeleteOfferChatConversationResponse(): DeleteOfferChatConversationResponse {
  return { ok: true };
}

export function toSendOfferChatMessageResponse(result: {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}): SendOfferChatMessageResponse {
  return {
    userMessage: presentMessage(result.userMessage),
    assistantMessage: presentMessage(result.assistantMessage),
  };
}
