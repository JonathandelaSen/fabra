export const CHAT_MESSAGE_ROLES = {
  user: "user",
  assistant: "assistant",
} as const;

export type ChatMessageRole =
  (typeof CHAT_MESSAGE_ROLES)[keyof typeof CHAT_MESSAGE_ROLES];

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  created_at: string;
}
