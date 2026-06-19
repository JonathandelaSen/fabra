import type { ChatMessage } from "@/components/shared/chat/chat-types";

export type AnalysisChatMessage = ChatMessage;

export interface AnalysisChatConversation {
  id: string;
  analysisId: string;
  title: string | null;
  messages: AnalysisChatMessage[];
}
