export interface AnalysisChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AnalysisChatConversation {
  id: string;
  analysis_id: string;
  title: string | null;
  messages: AnalysisChatMessage[];
}
