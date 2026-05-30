import type {
  CreateCVAnalysisResponse,
  DeleteCVAnalysisResponse,
  GetCVAnalysisResponse,
  ListCVAnalysesResponse,
  ScoreCVAnalysisResponse,
} from "@/app/api/cv-analyses/responses";
import type {
  CreateCVDocumentResponse,
  ListCVDocumentsResponse,
} from "@/app/api/cvs/responses";
import type { ListInterviewQuestionsResponse } from "@/app/api/interview-questions/responses";
import type { AIContext } from "@/lib/analysis-types";
import type { OfferStatus } from "@/lib/analysis-types";

type AIProvider = "gemini" | "mock";

export interface CreateCVAnalysisInput {
  cvId: string;
  title: string;
  model?: string;
}

export interface ScoreCVAnalysisInput {
  provider: AIProvider;
  apiKey: string;
  model: string;
  additionalContext: string | null;
}

export interface UpdateJobMatchAnalysisInput {
  job_url?: string | null;
  offer_status?: OfferStatus;
  offer_notes?: string;
  offer_next_action?: string;
  offer_next_action_at?: string | null;
}

export interface CreateInterviewQuestionInput {
  question: string;
  context: string | null;
  cv_id: string | null;
  analysis_id: string;
}

export interface GenerateInterviewQuestionInput {
  provider: AIProvider;
  apiKey: string;
  model: string;
  context: string;
  cv_id: string | null;
  analysis_id: string;
}

async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    details?: string;
  } & T;
  if (!res.ok) {
    throw new Error(data.error || data.details || fallbackMessage);
  }
  return data;
}

export async function listCVAnalyses() {
  const res = await fetch("/api/cv-analyses");
  return readJsonResponse<ListCVAnalysesResponse>(
    res,
    "Could not load CV analyses.",
  );
}

export async function getCVAnalysis(id: string) {
  const res = await fetch(`/api/cv-analyses/${id}`);
  return readJsonResponse<GetCVAnalysisResponse>(
    res,
    "Could not load CV analysis.",
  );
}

export async function createCVAnalysis(input: CreateCVAnalysisInput) {
  const res = await fetch("/api/cv-analyses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<CreateCVAnalysisResponse>(
    res,
    "Could not create CV analysis.",
  );
}

export async function scoreCVAnalysis(
  id: string,
  input: ScoreCVAnalysisInput,
) {
  const res = await fetch(`/api/cv-analyses/${id}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<ScoreCVAnalysisResponse>(
    res,
    "Could not score CV analysis.",
  );
}

export async function deleteCVAnalysis(id: string) {
  const res = await fetch(`/api/cv-analyses/${id}`, { method: "DELETE" });
  return readJsonResponse<DeleteCVAnalysisResponse>(
    res,
    "Could not delete CV analysis.",
  );
}

export async function listCVOptions() {
  const res = await fetch("/api/cvs");
  return readJsonResponse<ListCVDocumentsResponse>(
    res,
    "Could not load CVs.",
  );
}

export async function uploadCV(file: File, name: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);

  const res = await fetch("/api/cvs", {
    method: "POST",
    body: formData,
  });
  return readJsonResponse<CreateCVDocumentResponse>(
    res,
    "Could not upload CV.",
  );
}

export async function listInterviewQuestionsForAnalysis(analysisId: string) {
  const res = await fetch("/api/interview-questions");
  const questions = await readJsonResponse<ListInterviewQuestionsResponse>(
    res,
    "Could not load interview questions.",
  );
  return questions.filter((question) => question.analysisId === analysisId);
}

export async function updateJobMatchAnalysis(
  id: string,
  input: UpdateJobMatchAnalysisInput,
) {
  const res = await fetch(`/api/job-match-analyses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<unknown>(res, "Could not save job match analysis.");
}

export async function createInterviewQuestion(input: CreateInterviewQuestionInput) {
  const res = await fetch("/api/interview-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<{ id: string }>(res, "Could not create question.");
}

export async function generateInterviewQuestionAnswer(
  id: string,
  input: GenerateInterviewQuestionInput,
) {
  const res = await fetch(`/api/interview-questions/${id}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<unknown>(res, "Could not generate answer.");
}

export function toAdditionalContext(context: AIContext) {
  return context?.additionalContext ?? null;
}
