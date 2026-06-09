import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/modules/shared";
import { CVAnalysis } from "./cv-analysis.entity";
import { CVAnalysisId } from "../value-objects/cv-analysis-id.value-object";

const now = "2026-05-13T10:00:00.000Z";

describe("CVAnalysis", () => {
  it("creates and serializes a general CV analysis", () => {
    const analysis = CVAnalysis.create({
      id: CVAnalysisId.fromPrimitives("analysis-1"),
      userId: UserId.fromPrimitives("user-1"),
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
      aiContext: { additionalContext: "Focus on leadership" },
      analyzedAt: null,
      legacyAnalysisId: "analysis-1",
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    expect(analysis.toPrimitives()).toMatchObject({
      id: "analysis-1",
      userId: "user-1",
      cvDocumentId: "cv-1",
      title: "General analysis",
      keywords: [],
    });
  });

  it("hydrates from primitives", () => {
    const analysis = CVAnalysis.fromPrimitives({
      id: "analysis-1",
      userId: "user-1",
      cvDocumentId: "cv-1",
      cvStructuredProfileId: null,
      title: "General analysis",
      filename: "cv.pdf",
      fileSize: 100,
      pdfStoragePath: null,
      extractedText: {
        textPython: null,
        textPdfjs: "text",
        textNode: null,
        extractErrorPython: null,
        extractErrorPdfjs: null,
        extractErrorNode: null,
      },
      aiModel: "gemini",
      score: 80,
      feedback: "Good",
      keywords: ["React"],
      improvements: ["Add metrics"],
      aiContext: null,
      analyzedAt: "2026-05-13T11:00:00.000Z",
      legacyAnalysisId: "analysis-1",
      createdAt: now,
      updatedAt: now,
    });

    expect(analysis.id).toBe("analysis-1");
    expect(analysis.toPrimitives().score).toBe(80);
    expect(analysis.pullDomainEvents()).toEqual([]);
  });

  const buildAnalysis = () =>
    CVAnalysis.create({
      id: CVAnalysisId.fromPrimitives("analysis-1"),
      userId: UserId.fromPrimitives("user-1"),
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
      legacyAnalysisId: "analysis-1",
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

  it("records a created event on create", () => {
    const events = buildAnalysis().pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["cv_analysis_created"]);
    expect(events[0].toPrimitives()).toEqual({ analysisId: "analysis-1" });
  });

  it("records a scored event and applies the AI result", () => {
    const analysis = buildAnalysis();
    analysis.pullDomainEvents();

    analysis.applyAIResult({
      aiModel: "gemini",
      score: 82,
      feedback: "Strong profile",
      keywords: ["React", "Node"],
      improvements: ["Add metrics"],
      aiContext: { additionalContext: "Focus on leadership" },
      analyzedAt: "2026-05-13T11:00:00.000Z",
      updatedAt: "2026-05-13T11:00:00.000Z",
    });

    expect(analysis.toPrimitives()).toMatchObject({
      aiModel: "gemini",
      score: 82,
      feedback: "Strong profile",
      keywords: ["React", "Node"],
      analyzedAt: "2026-05-13T11:00:00.000Z",
    });

    const events = analysis.pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["cv_analysis_scored"]);
    expect(events[0].toPrimitives()).toEqual({
      analysisId: "analysis-1",
      score: 82,
      aiModel: "gemini",
    });
  });
});
