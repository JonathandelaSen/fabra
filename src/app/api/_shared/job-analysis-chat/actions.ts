export const CHAT_ACTIONS = {
  createConversation: "create_conversation",
  renameConversation: "rename_conversation",
  deleteConversation: "delete_conversation",
  message: "message",
} as const;

export type ChatAction = (typeof CHAT_ACTIONS)[keyof typeof CHAT_ACTIONS];
