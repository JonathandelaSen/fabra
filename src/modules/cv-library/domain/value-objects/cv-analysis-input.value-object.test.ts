import { describe, expect, it } from "vitest";
import { CVAnalysisInput } from "./cv-analysis-input.value-object";

const mockCvPrimitives = {
  id: "cv-1",
  userId: "user-1",
  name: "My Resume",
  filename: "cv.pdf",
  fileSize: 12345,
  pdfStoragePath: "user-1/cv-1.pdf",
  type: "uploaded" as const,
  sourceCvId: null,
  templateId: null,
  templateLocale: null,
  schemaVersion: null,
  sourceTextHash: "hash-123",
  aiModel: null,
  profile: null,
  extractedText: {
    textPython: "python text",
    textPdfjs: "pdfjs text",
    textNode: "node text",
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

const mockResultPrimitives = {
  cv: mockCvPrimitives,
  analysisText: "python text",
  filename: "cv.pdf",
  fileSize: 12345,
  pdfStoragePath: "user-1/cv-1.pdf",
  extractedText: mockCvPrimitives.extractedText,
  extractionDiagnostics: {
    filename: "cv.pdf",
    fileSize: 12345,
    pythonLength: 11,
    pdfjsLength: 10,
    nodeLength: 9,
    pythonError: false,
    pdfjsError: false,
    nodeError: false,
  },
};

describe("CVAnalysisInput", () => {
  it("creates from primitives and exposes accessors", () => {
    const result = CVAnalysisInput.fromPrimitives(mockResultPrimitives);

    expect(result.cv).toEqual(mockCvPrimitives);
    expect(result.analysisText).toBe("python text");
    expect(result.filename).toBe("cv.pdf");
    expect(result.fileSize).toBe(12345);
    expect(result.pdfStoragePath).toBe("user-1/cv-1.pdf");
    expect(result.extractedText).toEqual(mockCvPrimitives.extractedText);
    expect(result.extractionDiagnostics).toEqual(mockResultPrimitives.extractionDiagnostics);
  });

  it("round-trips through toPrimitives", () => {
    const result = CVAnalysisInput.fromPrimitives(mockResultPrimitives);
    expect(result.toPrimitives()).toEqual(mockResultPrimitives);
  });
});
