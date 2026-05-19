import type { StandardCVProfile } from "@/modules/cv-library";

export type CVDocumentType = "uploaded" | "template";

export interface CVDocumentSummaryResponse {
  id: string;
  name: string;
  filename: string | null;
  fileSize: number | null;
  type: CVDocumentType;
  sourceCvId: string | null;
  templateId: string | null;
  templateLocale: string | null;
  profile: StandardCVProfile | null;
  publicEnabled: boolean;
  publicId: string | null;
  publicSlug: string | null;
  publicPublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CVDocumentDetailResponse extends CVDocumentSummaryResponse {
  userId: string;
  pdfStoragePath: string | null;
  schemaVersion: string | null;
  sourceTextHash: string | null;
  aiModel: string | null;
  textPython: string | null;
  textPdfjs: string | null;
  textNode: string | null;
  extractErrorPython: string | null;
  extractErrorPdfjs: string | null;
  extractErrorNode: string | null;
}

export type ListCVDocumentsResponse = CVDocumentSummaryResponse[];
export type CreateCVDocumentResponse = CVDocumentDetailResponse;
export type GetCVDocumentResponse = CVDocumentDetailResponse;
export type UpdateCVDocumentResponse = CVDocumentDetailResponse;

export interface DeleteCVDocumentResponse {
  success: true;
}

export interface CVDocumentDeleteConflictResponse {
  error: string;
  analyses: Array<{
    id: string;
    title: string;
    filename: string;
    created_at: string;
    analysis_mode: string;
  }>;
}

interface LegacyCVDocumentSummary {
  id: string;
  name: string;
  filename: string | null;
  file_size: number | null;
  type: CVDocumentType;
  source_cv_id: string | null;
  template_id: string | null;
  template_locale: string | null;
  profile: StandardCVProfile | null;
  public_enabled: boolean;
  public_id: string | null;
  public_slug: string | null;
  public_published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LegacyCVDocumentDetail extends LegacyCVDocumentSummary {
  user_id: string;
  pdf_storage_path: string | null;
  schema_version: string | null;
  source_text_hash: string | null;
  ai_model: string | null;
  text_python: string | null;
  text_pdfjs: string | null;
  text_node: string | null;
  extract_error_python: string | null;
  extract_error_pdfjs: string | null;
  extract_error_node: string | null;
}

export function toCVDocumentSummaryResponse(
  input: LegacyCVDocumentSummary
): CVDocumentSummaryResponse {
  return {
    id: input.id,
    name: input.name,
    filename: input.filename,
    fileSize: input.file_size,
    type: input.type,
    sourceCvId: input.source_cv_id,
    templateId: input.template_id,
    templateLocale: input.template_locale,
    profile: input.profile,
    publicEnabled: input.public_enabled,
    publicId: input.public_id,
    publicSlug: input.public_slug,
    publicPublishedAt: input.public_published_at,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
  };
}

export function toCVDocumentDetailResponse(
  input: LegacyCVDocumentDetail
): CVDocumentDetailResponse {
  return {
    ...toCVDocumentSummaryResponse(input),
    userId: input.user_id,
    pdfStoragePath: input.pdf_storage_path,
    schemaVersion: input.schema_version,
    sourceTextHash: input.source_text_hash,
    aiModel: input.ai_model,
    textPython: input.text_python,
    textPdfjs: input.text_pdfjs,
    textNode: input.text_node,
    extractErrorPython: input.extract_error_python,
    extractErrorPdfjs: input.extract_error_pdfjs,
    extractErrorNode: input.extract_error_node,
  };
}

export function toCVDocumentSummaryResponses(
  input: LegacyCVDocumentSummary[]
): ListCVDocumentsResponse {
  return input.map(toCVDocumentSummaryResponse);
}
