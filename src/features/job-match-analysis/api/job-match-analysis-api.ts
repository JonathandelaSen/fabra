import type {
  ListJobMatchAnalysesResponse,
  GetJobMatchAnalysisResponse,
  ScoreJobMatchAnalysisResponse,
  UpdateJobMatchAnalysisResponse,
  DeleteJobMatchAnalysisResponse,
  JobMatchAnalysisOfferStatus,
} from "@/app/api/job-match-analyses/responses";
import type {
  GenerateInterviewQuestionResponse,
  SaveInterviewQuestionResponse,
} from "@/app/api/interview-questions/responses";
import type {
  AnalysisChatConversation,
  AnalysisChatMessage,
} from "../types";

export type JobMatchAnalysisSummary = ListJobMatchAnalysesResponse[number];
export type JobMatchAnalysisDetail = GetJobMatchAnalysisResponse;

export interface ScoreJobMatchAnalysisInput {
  provider: "gemini" | "mock";
  apiKey?: string;
  model: string;
  jobDescription: string;
  jobUrl: string | null;
}

export interface UpdateJobMatchAnalysisInput {
  jobUrl?: string | null;
  offerStatus?: JobMatchAnalysisOfferStatus;
  offerNotes?: string | null;
  offerNextAction?: string | null;
  offerNextActionAt?: string | null;
}

export interface CreateLinkedInterviewQuestionInput {
  question: string;
  context: string | null;
  cvId: string | null;
  analysisId: string;
}

export interface GenerateLinkedInterviewQuestionAnswerInput {
  provider: "gemini" | "mock";
  apiKey?: string;
  model: string;
  context: string;
  cvId: string | null;
  analysisId: string;
}

export interface SendJobMatchOfferChatMessageInput {
  message: string;
  provider: "gemini" | "mock";
  apiKey: string;
  model: string;
  conversationId: string;
}

export interface PrepareJobMatchOfferChatCopyPasteInput {
  conversationId: string;
  message: string;
}

export interface ApplyJobMatchOfferChatCopyPasteInput {
  conversationId: string;
  userMessage: string;
  assistantResponse: string;
}

async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

export async function listJobMatchAnalyses() {
  const res = await fetch("/api/job-match-analyses");
  return readJsonResponse<ListJobMatchAnalysesResponse>(
    res,
    "Could not load job match analyses."
  );
}

export async function getJobMatchAnalysis(id: string) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(id)}`
  );
  return readJsonResponse<GetJobMatchAnalysisResponse>(
    res,
    "Could not load job match analysis."
  );
}

export async function deleteJobMatchAnalysis(id: string) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  return readJsonResponse<DeleteJobMatchAnalysisResponse>(
    res,
    "Could not delete job match analysis."
  );
}

export async function scoreJobMatchAnalysis({
  id,
  input,
}: {
  id: string;
  input: ScoreJobMatchAnalysisInput;
}) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(id)}/score`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return readJsonResponse<ScoreJobMatchAnalysisResponse>(
    res,
    "Could not score job match analysis."
  );
}

export async function updateJobMatchAnalysis({
  id,
  updates,
}: {
  id: string;
  updates: UpdateJobMatchAnalysisInput;
}) {
  const body: Record<string, unknown> = {};
  if (updates.jobUrl !== undefined) body.job_url = updates.jobUrl;
  if (updates.offerStatus !== undefined) body.offer_status = updates.offerStatus;
  if (updates.offerNotes !== undefined) body.offer_notes = updates.offerNotes;
  if (updates.offerNextAction !== undefined) body.offer_next_action = updates.offerNextAction;
  if (updates.offerNextActionAt !== undefined) body.offer_next_action_at = updates.offerNextActionAt;

  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return readJsonResponse<UpdateJobMatchAnalysisResponse>(
    res,
    "Could not update job match analysis."
  );
}

export async function createLinkedInterviewQuestion(
  input: CreateLinkedInterviewQuestionInput
) {
  const res = await fetch("/api/interview-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<SaveInterviewQuestionResponse>(
    res,
    "Could not create linked interview question."
  );
}

export async function generateLinkedInterviewQuestionAnswer({
  id,
  input,
}: {
  id: string;
  input: GenerateLinkedInterviewQuestionAnswerInput;
}) {
  const res = await fetch(
    `/api/interview-questions/${encodeURIComponent(id)}/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return readJsonResponse<GenerateInterviewQuestionResponse>(
    res,
    "Could not generate linked interview answer."
  );
}

export async function listJobMatchOfferChatConversations(analysisId: string) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(analysisId)}/chat`
  );
  return readJsonResponse<{ conversations: AnalysisChatConversation[] }>(
    res,
    "Could not load chat conversations."
  );
}

export async function listJobMatchOfferChatMessages({
  analysisId,
  conversationId,
}: {
  analysisId: string;
  conversationId: string;
}) {
  const params = new URLSearchParams({ conversationId });
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(analysisId)}/chat?${params.toString()}`
  );
  return readJsonResponse<{ messages: AnalysisChatMessage[] }>(
    res,
    "Could not load chat messages."
  );
}

export async function createJobMatchOfferChatConversation(analysisId: string) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(analysisId)}/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_conversation" }),
    }
  );
  return readJsonResponse<{ conversation: AnalysisChatConversation }>(
    res,
    "Could not create chat conversation."
  );
}

export async function renameJobMatchOfferChatConversation({
  analysisId,
  conversationId,
  title,
}: {
  analysisId: string;
  conversationId: string;
  title: string;
}) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(analysisId)}/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "rename_conversation",
        conversationId,
        title,
      }),
    }
  );
  return readJsonResponse<{ conversation: AnalysisChatConversation }>(
    res,
    "Could not rename chat conversation."
  );
}

export async function deleteJobMatchOfferChatConversation({
  analysisId,
  conversationId,
}: {
  analysisId: string;
  conversationId: string;
}) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(analysisId)}/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_conversation",
        conversationId,
      }),
    }
  );
  return readJsonResponse<Record<string, never>>(
    res,
    "Could not delete chat conversation."
  );
}

export async function sendJobMatchOfferChatMessage({
  analysisId,
  input,
}: {
  analysisId: string;
  input: SendJobMatchOfferChatMessageInput;
}) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(analysisId)}/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return readJsonResponse<{
    userMessage: AnalysisChatMessage;
    assistantMessage: AnalysisChatMessage;
  }>(res, "Could not send chat message.");
}

export async function prepareJobMatchOfferChatCopyPaste({
  analysisId,
  input,
}: {
  analysisId: string;
  input: PrepareJobMatchOfferChatCopyPasteInput;
}) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(analysisId)}/chat/copy-paste/prepare`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return readJsonResponse<{ prompt: string; privacyNotice?: string }>(
    res,
    "Could not prepare copy paste chat."
  );
}

export async function applyJobMatchOfferChatCopyPaste({
  analysisId,
  input,
}: {
  analysisId: string;
  input: ApplyJobMatchOfferChatCopyPasteInput;
}) {
  const res = await fetch(
    `/api/job-match-analyses/${encodeURIComponent(analysisId)}/chat/copy-paste/apply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  return readJsonResponse<{
    userMessage: AnalysisChatMessage;
    assistantMessage: AnalysisChatMessage;
  }>(res, "Could not apply copy paste chat.");
}
