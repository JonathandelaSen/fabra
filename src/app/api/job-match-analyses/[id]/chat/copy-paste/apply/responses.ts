import type { JobAnalysisChatMessage } from "@/modules/job-analysis-chat";

export interface ApplyOfferChatCopyPasteResponse {
  userMessage: JobAnalysisChatMessage;
  assistantMessage: JobAnalysisChatMessage;
}
