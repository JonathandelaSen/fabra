import type { TemplateCVResponse } from "@/app/api/cvs/[id]/template/responses";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import type { CVTemplateLocale } from "@/lib/cv-templates";

interface CreateCVTemplateVersionInput {
  cvId: string;
  templateId: string;
  locale: CVTemplateLocale;
  provider: StoredAIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export type CreateCVTemplateVersionResponse = TemplateCVResponse;

async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as {
    details?: string;
    error?: string;
  } & T;
  if (!res.ok) throw new Error(data.error || data.details || fallbackMessage);
  return data;
}

export function createCVTemplateVersion({
  cvId,
  ...input
}: CreateCVTemplateVersionInput) {
  return fetch(`/api/cvs/${encodeURIComponent(cvId)}/template`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) =>
    readJsonResponse<TemplateCVResponse>(
      res,
      "Could not create the template version."
    )
  );
}
