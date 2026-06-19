import { describe, expect, it } from "vitest";
import { ImportedCVDocument } from "./imported-cv-document.value-object";
import { CVDocument } from "../entities/cv-document.entity";

const mockCvPrimitives = {
  id: "cv-1",
  userId: "user-1",
  name: "JSON Resume",
  filename: "resume.json",
  fileSize: 120,
  pdfStoragePath: "user-1/cv-1.json",
  type: "json_resume" as const,
  sourceCvId: null,
  templateId: null,
  templateLocale: null,
  schemaVersion: "1",
  sourceTextHash: null,
  aiModel: null,
  profile: null,
  extractedText: {
    textPython: null,
    textPdfjs: null,
    textNode: null,
    extractErrorPython: null,
    extractErrorPdfjs: null,
    extractErrorNode: null,
  },
  publicSettings: {
    enabled: false,
    feedbackEnabled: false,
    publicId: null,
    slug: null,
    publishedAt: null,
  },
  createdAt: "2026-06-17T00:00:00.000Z",
  updatedAt: "2026-06-17T00:00:00.000Z",
};

describe("ImportedCVDocument", () => {
  it("creates from entity and round-trips through primitives", () => {
    const document = CVDocument.fromPrimitives(mockCvPrimitives);
    const result = ImportedCVDocument.create(document, ["warning-1"]);

    expect(result.document).toBe(document);
    expect(result.warnings).toEqual(["warning-1"]);

    const primitives = result.toPrimitives();
    expect(primitives.document).toEqual(mockCvPrimitives);
    expect(primitives.warnings).toEqual(["warning-1"]);

    const restored = ImportedCVDocument.fromPrimitives(primitives);
    expect(restored.toPrimitives()).toEqual(primitives);
  });
});
