import type { JobAnalysisChatMessage } from "@/backend/modules/job-analysis-chat";

export interface ApplyOfferChatCopyPasteResponse {
  userMessage: JobAnalysisChatMessage;
  assistantMessage: JobAnalysisChatMessage;
}
