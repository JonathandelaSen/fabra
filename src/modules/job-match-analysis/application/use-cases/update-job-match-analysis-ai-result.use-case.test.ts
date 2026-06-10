import { describe, expect, it, vi } from "vitest";
import { JobMatchAnalysis } from "../../domain/entities/job-match-analysis.entity";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import { UpdateJobMatchAnalysisAIResultUseCase } from "./update-job-match-analysis-ai-result.use-case";

function makeAnalysis() {
  return JobMatchAnalysis.fromPrimitives({
    id: "analysis-1",
    userId: "user-1",
    cvDocumentId: "cv-1",
    cvStructuredProfileId: null,
    jobOpportunityId: null,
    title: "Match",
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
    legacyAnalysisId: null,
    createdAt: "2026-05-13T10:00:00.000Z",
    updatedAt: "2026-05-13T10:00:00.000Z",
  });
}

describe("UpdateJobMatchAnalysisAIResultUseCase", () => {
  it("stores AI result and job match keyword fields", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () => makeAnalysis()),
      save: vi.fn(async (analysis) => analysis),
      delete: vi.fn(),
    } satisfies JobMatchAnalysisRepository;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new UpdateJobMatchAnalysisAIResultUseCase({
      repo,
      eventBus: eventBus as never,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      aiModel: "model",
      jobDescription: "Build things",
      jobUrl: null,
      score: 77,
      feedback: "Close",
      aiKeywords: ["react"],
      improvements: ["testing"],
      jobKeyData: { company: "Acme" },
      jobKeywords: ["react"],
      cvKeywords: ["ts"],
      matchingKeywords: ["react"],
      missingKeywords: ["k8s"],
    });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("job_match_analysis_scored");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      analysisId: "analysis-1",
      score: 77,
      aiModel: "model",
    });
    expect(result?.toPrimitives()).toMatchObject({
      score: 77,
      aiKeywords: ["react"],
      jobKeywords: ["react"],
      missingKeywords: ["k8s"],
      jobSnapshot: { keyData: { company: "Acme" } },
    });
  });
});
