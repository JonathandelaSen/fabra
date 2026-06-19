import { describe, expect, it, vi } from "vitest";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import { CreateJobMatchAnalysisUseCase } from "./create-job-match-analysis.use-case";

describe("CreateJobMatchAnalysisUseCase", () => {
  it("creates a job-match aggregate with an initial job snapshot", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(async (analysis) => analysis),
      delete: vi.fn(),
    } satisfies JobMatchAnalysisRepository;

    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new CreateJobMatchAnalysisUseCase({ repo, eventBus: eventBus as never }).execute({
      id: "analysis-1",
      userId: "user-1",
      cvDocumentId: "cv-1",
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
      aiModel: "model",
      jobDescription: "Build things",
      jobUrl: "https://example.com/job",
    });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("job_match_analysis_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      analysisId: "analysis-1",
    });
    expect(result.toPrimitives().jobSnapshot).toMatchObject({
      description: "Build things",
      url: "https://example.com/job",
      keyData: null,
    });
  });
});
