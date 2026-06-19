import { describe, expect, it, vi } from "vitest";
import { JobMatchAnalysis } from "../../domain/entities/job-match-analysis.entity";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import { UpdateJobMatchAnalysisJobUrlUseCase } from "./update-job-match-analysis-job-url.use-case";

describe("UpdateJobMatchAnalysisJobUrlUseCase", () => {
  it("updates only the URL inside the job snapshot", async () => {
    const current = JobMatchAnalysis.fromPrimitives({
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
      jobSnapshot: { description: "Job", url: null },
      jobKeywords: [],
      cvKeywords: [],
      matchingKeywords: [],
      missingKeywords: [],
      analyzedAt: null,
      legacyAnalysisId: null,
      createdAt: "2026-05-13T10:00:00.000Z",
      updatedAt: "2026-05-13T10:00:00.000Z",
    });
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () => current),
      save: vi.fn(async (analysis) => analysis),
      delete: vi.fn(),
    } satisfies JobMatchAnalysisRepository;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new UpdateJobMatchAnalysisJobUrlUseCase({
      repo,
      eventBus: eventBus as never,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      jobUrl: "https://example.com/job",
    });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("job_match_analysis_job_url_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      analysisId: "analysis-1",
      jobUrl: "https://example.com/job",
    });
    expect(result?.toPrimitives().jobSnapshot).toMatchObject({
      description: "Job",
      url: "https://example.com/job",
    });
  });
});
