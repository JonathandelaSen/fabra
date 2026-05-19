import { describe, expect, it } from "vitest";
import {
  toCVDocumentDetailResponse,
  toCVDocumentSummaryResponse,
  type GetCVDocumentResponse,
  type ListCVDocumentsResponse,
} from "./responses";

const legacyCV = {
  id: "cv-1",
  user_id: "user-1",
  name: "Senior Frontend CV",
  filename: "frontend.pdf",
  file_size: 1234,
  pdf_storage_path: "user-1/cv-1-frontend.pdf",
  type: "uploaded" as const,
  source_cv_id: null,
  template_id: null,
  template_locale: null,
  schema_version: "2026-05",
  source_text_hash: "hash-1",
  ai_model: "mock-model",
  profile: null,
  public_enabled: false,
  public_id: null,
  public_slug: null,
  public_published_at: null,
  text_python: "Python text",
  text_pdfjs: null,
  text_node: null,
  extract_error_python: null,
  extract_error_pdfjs: "missing",
  extract_error_node: null,
  created_at: "2026-05-18T10:00:00.000Z",
  updated_at: "2026-05-18T11:00:00.000Z",
};

describe("CV API response contracts", () => {
  it("maps CV summaries to camelCase HTTP response data", () => {
    const response = toCVDocumentSummaryResponse(legacyCV);

    expect(response satisfies ListCVDocumentsResponse[number]).toEqual({
      id: "cv-1",
      name: "Senior Frontend CV",
      filename: "frontend.pdf",
      fileSize: 1234,
      type: "uploaded",
      sourceCvId: null,
      templateId: null,
      templateLocale: null,
      profile: null,
      publicEnabled: false,
      publicId: null,
      publicSlug: null,
      publicPublishedAt: null,
      createdAt: "2026-05-18T10:00:00.000Z",
      updatedAt: "2026-05-18T11:00:00.000Z",
    });
  });

  it("maps CV details to camelCase HTTP response data", () => {
    const response = toCVDocumentDetailResponse(legacyCV);

    expect(response satisfies GetCVDocumentResponse).toMatchObject({
      id: "cv-1",
      userId: "user-1",
      fileSize: 1234,
      pdfStoragePath: "user-1/cv-1-frontend.pdf",
      sourceCvId: null,
      schemaVersion: "2026-05",
      sourceTextHash: "hash-1",
      aiModel: "mock-model",
      publicEnabled: false,
      textPython: "Python text",
      textPdfjs: null,
      extractErrorPdfjs: "missing",
      createdAt: "2026-05-18T10:00:00.000Z",
    });
  });
});
