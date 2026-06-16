import type { StandardCVProfile } from "@/lib/cv-profile";
import { normalizeStandardCVProfile } from "@/lib/cv-profile";
import type { CVRecommendationAnalysis } from "@/lib/analysis-types";
import type { CVTemplateLocale } from "@/lib/cv-templates";
import type { CVDocumentListItem } from "@/features/cv-library";
import type { UpdateCVDocumentResponse } from "@/app/api/cvs/responses";
import type { EditCVProfileResponse } from "@/app/api/cvs/[id]/edit/responses";
import type { SaveTemplateAsCVResponse } from "@/app/api/cvs/[id]/save-as-cv/responses";
import type { CVRecommendationsResponse } from "@/app/api/cvs/[id]/recommendations/responses";

async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    details?: string;
  } & T;
  if (!res.ok) throw new Error(data.error || data.details || fallbackMessage);
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCVResponse(data: any): CVDocumentListItem {
  return {
    id: data.id,
    name: data.name,
    filename: data.filename,
    fileSize: data.fileSize ?? data.file_size ?? null,
    type: data.type,
    sourceCvId: data.sourceCvId ?? data.source_cv_id ?? null,
    templateId: data.templateId ?? data.template_id ?? null,
    templateLocale: data.templateLocale ?? data.template_locale ?? null,
    profile: data.profile ?? null,
    publicEnabled: data.publicEnabled ?? data.public_enabled ?? false,
    publicFeedbackEnabled: data.publicFeedbackEnabled ?? data.public_feedback_enabled ?? false,
    publicId: data.publicId ?? data.public_id ?? null,
    publicSlug: data.publicSlug ?? data.public_slug ?? null,
    publicPublishedAt:
      data.publicPublishedAt ?? data.public_published_at ?? null,
    createdAt: data.createdAt ?? data.created_at ?? "",
    updatedAt: data.updatedAt ?? data.updated_at ?? "",
  };
}

export interface SaveProfileInput {
  cvId: string;
  profile: StandardCVProfile;
}

export async function saveProfile({ cvId, profile }: SaveProfileInput) {
  const normalized = normalizeStandardCVProfile(profile);
  const res = await fetch(`/api/cvs/${encodeURIComponent(cvId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: normalized }),
  });
  return readJsonResponse<UpdateCVDocumentResponse>(
    res,
    "Could not save profile.",
  );
}

export interface ApplyInstructionInput {
  cvId: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  instruction: string;
}

export async function applyInstruction({
  cvId,
  provider,
  apiKey,
  model,
  instruction,
}: ApplyInstructionInput) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(cvId)}/edit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, apiKey, model, instruction }),
  });
  return readJsonResponse<EditCVProfileResponse>(res, "Edit failed.");
}

export interface SaveAsCVInput {
  cvId: string;
  name: string;
}

export async function saveAsCV({ cvId, name }: SaveAsCVInput) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(cvId)}/save-as-cv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return readJsonResponse<SaveTemplateAsCVResponse>(res, "Could not save as CV.");
}

export interface UpdateLocaleInput {
  cvId: string;
  locale: CVTemplateLocale;
}

export async function updateLocale({ cvId, locale }: UpdateLocaleInput) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(cvId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template_locale: locale }),
  });
  return readJsonResponse<UpdateCVDocumentResponse>(
    res,
    "Could not change language.",
  );
}

export interface UpdatePublicSettingsInput {
  cvId: string;
  enabled: boolean;
  slug: string;
  confirmPublicExposure?: boolean;
}

export async function updatePublicSettings({
  cvId,
  enabled,
  slug,
  confirmPublicExposure = false,
}: UpdatePublicSettingsInput) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(cvId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      public_enabled: enabled,
      public_slug: slug,
      confirmPublicExposure,
    }),
  });
  return readJsonResponse<UpdateCVDocumentResponse>(
    res,
    "Could not update public page.",
  );
}

export async function updatePublicFeedbackEnabled(cvId: string, enabled: boolean) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(cvId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_feedback_enabled: enabled }),
  });
  return readJsonResponse<UpdateCVDocumentResponse>(
    res,
    "Could not update feedback setting.",
  );
}

async function requestRecommendations(
  sourceCvId: string,
): Promise<CVRecommendationsResponse> {
  const res = await fetch(
    `/api/cvs/${encodeURIComponent(sourceCvId)}/recommendations`,
  );
  return readJsonResponse<CVRecommendationsResponse>(
    res,
    "Could not load recommendations.",
  );
}

export async function fetchRecommendations(
  sourceCvId: string
): Promise<CVRecommendationAnalysis | null> {
  const data = await requestRecommendations(sourceCvId);
  return data.analysis ?? null;
}
