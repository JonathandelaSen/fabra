export interface InterviewQuestionSummary {
  id: string;
  userId: string;
  question: string;
  context: string | null;
  answer: string | null;
  cvId: string | null;
  analysisId: string | null;
  aiModel: string | null;
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisChatConversation {
  id: string;
  user_id: string;
  analysis_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisChatMessage {
  id: string;
  user_id: string;
  analysis_id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  model: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type {
  JobMatchAnalysisDetailResponse,
  ListJobMatchAnalysesResponse,
} from "@/app/api/job-match-analyses/responses";
export type { JobMatchAnalysisDetail } from "./api/job-match-analysis-api";
