import { describe, expect, it } from "vitest";
import {
  CVAnalysisDetails,
  type CVAnalysisDetailsPrimitives,
} from "./cv-analysis-details.value-object";

const details: CVAnalysisDetailsPrimitives = {
  cvDocumentId: "cv-1",
  cvStructuredProfileId: null,
  title: "General analysis",
  filename: "cv.pdf",
  fileSize: 100,
  pdfStoragePath: "user-1/cv.pdf",
  extractedText: {
    textPython: "text",
    textPdfjs: null,
    textNode: null,
    extractErrorPython: null,
    extractErrorPdfjs: null,
    extractErrorNode: null,
  },
  aiModel: null,
  score: null,
  feedback: null,
  keywords: [],
  improvements: [],
  aiContext: null,
  analyzedAt: null,
  legacyAnalysisId: "legacy-1",
};

describe("CVAnalysisDetails", () => {
  it("hydrates and serializes immutable primitives", () => {
    const value = CVAnalysisDetails.fromPrimitives(details);
    const primitives = value.toPrimitives();

    primitives.keywords.push("mutated");
    primitives.extractedText.textPython = "mutated";

    expect(value.toPrimitives()).toMatchObject({
      title: "General analysis",
      keywords: [],
      extractedText: { textPython: "text" },
    });
  });

  it("returns a new value object with AI result applied", () => {
    const value = CVAnalysisDetails.fromPrimitives(details);
    const updated = value.withAIResult({
      aiModel: "gemini",
      score: 82,
      feedback: "Strong profile",
      keywords: ["React"],
      improvements: ["Add metrics"],
      aiContext: { additionalContext: "Focus on leadership" },
      analyzedAt: "2026-05-13T11:00:00.000Z",
    });

    expect(value.toPrimitives().score).toBeNull();
    expect(updated.toPrimitives()).toMatchObject({
      aiModel: "gemini",
      score: 82,
      keywords: ["React"],
    });
  });
});
