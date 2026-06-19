import type { ScoreJobMatchAnalysisResponse } from "@/app/api/job-match-analyses/responses";
import type { PrepareJobMatchAnalysisCopyPasteResponse } from "@/app/api/job-match-analyses/[id]/score/copy-paste/prepare/responses";
import type {
  JobMatchAnalysisCopyPasteResult,
  PreviewJobMatchAnalysisCopyPasteResponse,
} from "@/app/api/job-match-analyses/[id]/score/copy-paste/preview/responses";

async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

export type { JobMatchAnalysisCopyPasteResult };

export function prepareJobMatchAnalysisCopyPaste(
  id: string,
  input: { jobDescription: string; jobUrl: string | null; language?: string },
) {
  return fetch(
    `/api/job-match-analyses/${encodeURIComponent(id)}/score/copy-paste/prepare`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  ).then((res) =>
    readJsonResponse<PrepareJobMatchAnalysisCopyPasteResponse>(
      res,
      "Could not prepare the external chat prompt.",
    ),
  );
}

export function previewJobMatchAnalysisCopyPaste(
  id: string,
  input: { rawResponse: string },
) {
  return fetch(
    `/api/job-match-analyses/${encodeURIComponent(id)}/score/copy-paste/preview`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  ).then((res) =>
    readJsonResponse<PreviewJobMatchAnalysisCopyPasteResponse>(
      res,
      "Could not validate the pasted response.",
    ),
  );
}

export function applyJobMatchAnalysisCopyPaste(
  id: string,
  input: {
    parsedResult: JobMatchAnalysisCopyPasteResult;
    jobDescription: string;
    jobUrl: string | null;
  },
) {
  return fetch(
    `/api/job-match-analyses/${encodeURIComponent(id)}/score/copy-paste/apply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  ).then((res) =>
    readJsonResponse<ScoreJobMatchAnalysisResponse>(
      res,
      "Could not apply the external chat analysis.",
    ),
  );
}
