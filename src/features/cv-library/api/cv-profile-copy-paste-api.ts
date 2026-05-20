import type { ApplyCVProfileCopyPasteResponse } from "@/app/api/cvs/[id]/structured-profile/copy-paste/apply/responses";
import type { PrepareCVProfileCopyPasteResponse } from "@/app/api/cvs/[id]/structured-profile/copy-paste/prepare/responses";
import type { PreviewCVProfileCopyPasteResponse } from "@/app/api/cvs/[id]/structured-profile/copy-paste/preview/responses";
import { readJsonResponse } from "./cv-library-api";

interface CVProfileCopyPasteContext {
  templateId?: string | null;
  locale?: string | null;
}

export function prepareCVProfileCopyPaste(
  cvId: string,
  input: CVProfileCopyPasteContext,
) {
  return fetch(
    `/api/cvs/${encodeURIComponent(cvId)}/structured-profile/copy-paste/prepare`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  ).then((res) =>
    readJsonResponse<PrepareCVProfileCopyPasteResponse>(
      res,
      "Could not prepare the external chat prompt.",
    ),
  );
}

export function previewCVProfileCopyPaste(
  cvId: string,
  input: { rawResponse: string },
) {
  return fetch(
    `/api/cvs/${encodeURIComponent(cvId)}/structured-profile/copy-paste/preview`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  ).then((res) =>
    readJsonResponse<PreviewCVProfileCopyPasteResponse>(
      res,
      "Could not validate the external chat response.",
    ),
  );
}

export function applyCVProfileCopyPaste(
  cvId: string,
  input: CVProfileCopyPasteContext & {
    parsedResult: PreviewCVProfileCopyPasteResponse["parsedResult"];
    createTemplateVersion: boolean;
  },
) {
  return fetch(
    `/api/cvs/${encodeURIComponent(cvId)}/structured-profile/copy-paste/apply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  ).then((res) =>
    readJsonResponse<ApplyCVProfileCopyPasteResponse>(
      res,
      "Could not apply the structured profile.",
    ),
  );
}
