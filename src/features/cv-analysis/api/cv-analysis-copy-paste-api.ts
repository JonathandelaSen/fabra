import type { ScoreCVAnalysisResponse } from "@/app/api/cv-analyses/responses";
import type { PrepareCVAnalysisCopyPasteResponse } from "@/app/api/cv-analyses/[id]/score/copy-paste/prepare/responses";
import type {
  CVAnalysisCopyPasteResult,
  PreviewCVAnalysisCopyPasteResponse,
} from "@/app/api/cv-analyses/[id]/score/copy-paste/preview/responses";

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

export function prepareCVAnalysisCopyPaste(
  id: string,
  input: { additionalContext: string | null; language?: string },
) {
  return fetch(`/api/cv-analyses/${id}/score/copy-paste/prepare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) =>
    readJsonResponse<PrepareCVAnalysisCopyPasteResponse>(
      res,
      "Could not prepare the external chat prompt.",
    ),
  );
}

export function previewCVAnalysisCopyPaste(
  id: string,
  input: { rawResponse: string; interactionId: string | null; attemptId: string | null },
) {
  return fetch(`/api/cv-analyses/${id}/score/copy-paste/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) =>
    readJsonResponse<PreviewCVAnalysisCopyPasteResponse>(
      res,
      "Could not validate the pasted response.",
    ),
  );
}

export function applyCVAnalysisCopyPaste(
  id: string,
  input: {
    parsedResult: CVAnalysisCopyPasteResult;
    interactionId: string | null;
    attemptId: string | null;
  },
) {
  return fetch(`/api/cv-analyses/${id}/score/copy-paste/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) =>
    readJsonResponse<ScoreCVAnalysisResponse>(
      res,
      "Could not apply the external chat analysis.",
    ),
  );
}
