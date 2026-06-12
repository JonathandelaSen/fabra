import type { StandardCVProfile } from "@/lib/cv-profile";
import { normalizeStandardCVProfile } from "@/lib/cv-profile";
import type { CVRecommendationAnalysis } from "@/lib/analysis-types";
import type { CVTemplateLocale } from "@/lib/cv-templates";
import type { CVDocumentListItem } from "@/features/cv-library";

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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not save profile.");
  return normalizeCVResponse(data);
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
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Unexpected server response (${res.status})`);
  }
  if (!res.ok) throw new Error(data.error || data.details || "Edit failed.");
  return { version: normalizeCVResponse(data.version), profile: data.version?.profile ?? null };
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
  if (!res.ok) throw new Error("Could not save as CV.");
  return res.json();
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not change language.");
  return normalizeCVResponse(data);
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not update public page.");
  return normalizeCVResponse(data);
}

export async function updatePublicFeedbackEnabled(cvId: string, enabled: boolean) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(cvId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_feedback_enabled: enabled }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not update feedback setting.");
  return normalizeCVResponse(data);
}

export async function fetchRecommendations(
  sourceCvId: string
): Promise<CVRecommendationAnalysis | null> {
  const res = await fetch(
    `/api/cvs/${encodeURIComponent(sourceCvId)}/recommendations`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.analysis ?? null;
}
