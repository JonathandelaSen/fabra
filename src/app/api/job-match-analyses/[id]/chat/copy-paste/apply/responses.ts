import type { AnalysisChatMessage } from "@/modules/analysis-chat";

export interface ApplyOfferChatCopyPasteResponse {
  userMessage: AnalysisChatMessage;
  assistantMessage: AnalysisChatMessage;
}
