import type { ChatMessage } from "@/components/shared/chat/chat-types";

export type AnalysisChatMessage = ChatMessage;

export interface AnalysisChatConversation {
  id: string;
  analysis_id: string;
  title: string | null;
  messages: AnalysisChatMessage[];
}
