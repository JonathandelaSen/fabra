import type { PrepareCVEditorCopyPasteResponse } from "@/app/api/cvs/[id]/edit/copy-paste/prepare/responses";
import type { PreviewCVEditorCopyPasteResponse } from "@/app/api/cvs/[id]/edit/copy-paste/preview/responses";
import type { ApplyCVEditorCopyPasteResponse } from "@/app/api/cvs/[id]/edit/copy-paste/apply/responses";

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

export function prepareCVEditorCopyPaste(
  cvId: string,
  input: { instruction: string },
) {
  return fetch(`/api/cvs/${encodeURIComponent(cvId)}/edit/copy-paste/prepare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) =>
    readJsonResponse<PrepareCVEditorCopyPasteResponse>(
      res,
      "Could not prepare the external chat prompt.",
    ),
  );
}

export function previewCVEditorCopyPaste(
  cvId: string,
  input: { rawResponse: string },
) {
  return fetch(`/api/cvs/${encodeURIComponent(cvId)}/edit/copy-paste/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) =>
    readJsonResponse<PreviewCVEditorCopyPasteResponse>(
      res,
      "Could not validate the pasted response.",
    ),
  );
}

export function applyCVEditorCopyPaste(
  cvId: string,
  input: { parsedResult: unknown },
) {
  return fetch(`/api/cvs/${encodeURIComponent(cvId)}/edit/copy-paste/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) =>
    readJsonResponse<ApplyCVEditorCopyPasteResponse>(
      res,
      "Could not apply the edited profile.",
    ),
  );
}
