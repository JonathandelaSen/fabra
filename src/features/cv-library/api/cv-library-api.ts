import type { AnalysisSummary } from "@/lib/analysis-types";
import type { InterviewQuestionResponse } from "@/app/api/interview-questions/responses";
import type { JobMatchAnalysisSummaryResponse } from "@/app/api/job-match-analyses/responses";
import type {
  CreateCVDocumentResponse,
  CVDocumentDeleteConflictResponse,
  DeleteCVDocumentResponse,
  GetCVDocumentResponse,
  ListCVDocumentsResponse,
  UpdateCVDocumentResponse,
} from "@/app/api/cvs/responses";
import { CV_DELETE_CONFLICT_CODE } from "@/app/api/cvs/responses";

export type CVDeleteConflictAnalysis =
  CVDocumentDeleteConflictResponse["analyses"][number];

export class CVDeleteConflictError extends Error {
  readonly code = CV_DELETE_CONFLICT_CODE;
  readonly analyses: AnalysisSummary[];

  constructor(analyses: AnalysisSummary[]) {
    super(CV_DELETE_CONFLICT_CODE);
    this.name = "CVDeleteConflictError";
    this.analyses = analyses;
  }
}

export type CVDocumentListItem = ListCVDocumentsResponse[number];
export type CVDocumentDetail = GetCVDocumentResponse;

export interface RenameCVDocumentInput {
  id: string;
  name: string;
}

export async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

export async function listCVDocuments() {
  const res = await fetch("/api/cvs");
  return readJsonResponse<ListCVDocumentsResponse>(
    res,
    "Could not load CV documents."
  );
}

export async function getCVDocument(id: string) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(id)}`);
  return readJsonResponse<GetCVDocumentResponse>(
    res,
    "Could not load CV document."
  );
}

export async function uploadCVDocument(formData: FormData) {
  const res = await fetch("/api/cvs", {
    method: "POST",
    body: formData,
  });
  return readJsonResponse<CreateCVDocumentResponse>(
    res,
    "Could not upload CV document."
  );
}

export async function renameCVDocument({ id, name }: RenameCVDocumentInput) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return readJsonResponse<UpdateCVDocumentResponse>(
    res,
    "Could not rename CV document."
  );
}

export async function deleteCVDocument(id: string) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (res.status === 409) {
    const data = (await res
      .json()
      .catch(() => ({}))) as Partial<CVDocumentDeleteConflictResponse>;
    if (data.code === CV_DELETE_CONFLICT_CODE) {
      throw new CVDeleteConflictError(data.analyses ?? []);
    }
  }
  return readJsonResponse<DeleteCVDocumentResponse>(
    res,
    "Could not delete CV document."
  );
}

export interface ImportJsonResumeInput {
  jsonContent: string;
  name?: string;
  filename?: string;
}

export interface ImportJsonResumeResponse {
  document: CreateCVDocumentResponse;
  warnings: string[];
}

export async function importJsonResume(input: ImportJsonResumeInput) {
  const res = await fetch("/api/cvs/json-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: input.jsonContent, name: input.name }),
  });
  return readJsonResponse<ImportJsonResumeResponse>(
    res,
    "Could not import JSON Resume."
  );
}

function normalizeJobMatchSummary(
  s: JobMatchAnalysisSummaryResponse
): AnalysisSummary {
  return {
    id: s.id,
    cv_id: s.cvId,
    title: s.title,
    filename: s.filename,
    created_at: s.createdAt,
    analysis_mode: "job_match",
    ai_score: s.aiScore,
    ai_analyzed_at: s.aiAnalyzedAt,
    job_url: s.jobUrl,
    offer_status: s.offerStatus,
    offer_next_action_at: s.offerNextActionAt,
  };
}

export async function parseCVDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/parse", {
    method: "POST",
    body: formData,
  });
  return readJsonResponse<{ id: string }>(res, "Could not parse CV document.");
}

export async function listAllAnalyses(): Promise<AnalysisSummary[]> {
  const [cvRes, jobRes] = await Promise.all([
    fetch("/api/cv-analyses"),
    fetch("/api/job-match-analyses"),
  ]);
  const cvAnalyses: AnalysisSummary[] = cvRes.ok ? await cvRes.json() : [];
  const jobRaw: JobMatchAnalysisSummaryResponse[] = jobRes.ok
    ? await jobRes.json()
    : [];
  return [...cvAnalyses, ...jobRaw.map(normalizeJobMatchSummary)].sort(
    (a, b) => b.created_at.localeCompare(a.created_at)
  );
}

export async function listInterviewQuestionsForLibrary(): Promise<
  InterviewQuestionResponse[]
> {
  const res = await fetch("/api/interview-questions");
  return res.ok ? ((await res.json()) as InterviewQuestionResponse[]) : [];
}
