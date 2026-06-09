import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/modules/shared";
import { JobMatchAnalysis } from "./job-match-analysis.entity";
import { JobMatchAnalysisId } from "../value-objects/job-match-analysis-id.value-object";

const now = "2026-05-13T10:00:00.000Z";

describe("JobMatchAnalysis", () => {
  it("creates and serializes a job match analysis", () => {
    const analysis = JobMatchAnalysis.create({
      id: JobMatchAnalysisId.fromPrimitives("analysis-1"),
      userId: UserId.fromPrimitives("user-1"),
      cvDocumentId: "cv-1",
      cvStructuredProfileId: null,
      jobOpportunityId: "job-1",
      title: "Offer analysis",
      filename: "cv.pdf",
      fileSize: 100,
      pdfStoragePath: null,
      extractedText: {
        textPython: "text",
        textPdfjs: null,
        textNode: null,
        extractErrorPython: null,
        extractErrorPdfjs: null,
        extractErrorNode: null,
      },
      aiModel: "gemini",
      score: 90,
      feedback: "Strong",
      aiKeywords: ["React"],
      improvements: ["Add metrics"],
      jobSnapshot: { description: "Job", url: "https://example.com", keyData: null },
      jobKeywords: ["React"],
      cvKeywords: ["React"],
      matchingKeywords: ["React"],
      missingKeywords: [],
      analyzedAt: "2026-05-13T11:00:00.000Z",
      legacyAnalysisId: "analysis-1",
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    expect(analysis.toPrimitives()).toMatchObject({
      id: "analysis-1",
      jobOpportunityId: "job-1",
      score: 90,
      matchingKeywords: ["React"],
    });
  });

  const buildAnalysis = () =>
    JobMatchAnalysis.create({
      id: JobMatchAnalysisId.fromPrimitives("analysis-1"),
      userId: UserId.fromPrimitives("user-1"),
      cvDocumentId: "cv-1",
      cvStructuredProfileId: null,
      jobOpportunityId: "job-1",
      title: "Offer analysis",
      filename: "cv.pdf",
      fileSize: 100,
      pdfStoragePath: null,
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
      aiKeywords: [],
      improvements: [],
      jobSnapshot: null,
      jobKeywords: [],
      cvKeywords: [],
      matchingKeywords: [],
      missingKeywords: [],
      analyzedAt: null,
      legacyAnalysisId: "analysis-1",
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

  it("records a created event on create", () => {
    const events = buildAnalysis().pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["job_match_analysis_created"]);
    expect(events[0].toPrimitives()).toEqual({ analysisId: "analysis-1" });
  });

  it("does not record events when hydrated from primitives", () => {
    const hydrated = JobMatchAnalysis.fromPrimitives(buildAnalysis().toPrimitives());
    expect(hydrated.pullDomainEvents()).toEqual([]);
  });

  it("records a scored event and applies the AI result", () => {
    const analysis = buildAnalysis();
    analysis.pullDomainEvents();

    analysis.applyAIResult({
      aiModel: "gemini",
      score: 88,
      feedback: "Good match",
      aiKeywords: ["React"],
      improvements: ["Add metrics"],
      jobSnapshot: { description: "Job", url: "https://example.com", keyData: null },
      jobKeywords: ["React", "Node"],
      cvKeywords: ["React"],
      matchingKeywords: ["React"],
      missingKeywords: ["Node"],
      analyzedAt: "2026-05-13T11:00:00.000Z",
      updatedAt: "2026-05-13T11:00:00.000Z",
    });

    expect(analysis.toPrimitives()).toMatchObject({
      aiModel: "gemini",
      score: 88,
      missingKeywords: ["Node"],
      analyzedAt: "2026-05-13T11:00:00.000Z",
    });

    const events = analysis.pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["job_match_analysis_scored"]);
    expect(events[0].toPrimitives()).toEqual({
      analysisId: "analysis-1",
      score: 88,
      aiModel: "gemini",
    });
  });

  it("records a job-url-updated event and merges the snapshot", () => {
    const analysis = buildAnalysis();
    analysis.applyAIResult({
      aiModel: "gemini",
      score: 88,
      feedback: "Good match",
      aiKeywords: [],
      improvements: [],
      jobSnapshot: { description: "Job", url: "https://old.example.com", keyData: null },
      jobKeywords: [],
      cvKeywords: [],
      matchingKeywords: [],
      missingKeywords: [],
      analyzedAt: "2026-05-13T11:00:00.000Z",
      updatedAt: "2026-05-13T11:00:00.000Z",
    });
    analysis.pullDomainEvents();

    analysis.updateJobUrl("https://new.example.com", "2026-05-13T12:00:00.000Z");

    expect(analysis.toPrimitives().jobSnapshot).toEqual({
      description: "Job",
      url: "https://new.example.com",
      keyData: null,
    });

    const events = analysis.pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["job_match_analysis_job_url_updated"]);
    expect(events[0].toPrimitives()).toEqual({
      analysisId: "analysis-1",
      jobUrl: "https://new.example.com",
    });
  });
});
