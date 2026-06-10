import { describe, expect, it, vi } from "vitest";
import { CreateCVAnalysisUseCase } from "./create-cv-analysis.use-case";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";

describe("CreateCVAnalysisUseCase", () => {
  it("creates a CV analysis aggregate and saves it", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(async (analysis) => analysis),
      delete: vi.fn(),
    } satisfies CVAnalysisRepository;

    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new CreateCVAnalysisUseCase({ repo, eventBus: eventBus as never }).execute({
      id: "analysis-1",
      userId: "user-1",
      cvDocumentId: "cv-1",
      title: "General",
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
      aiContext: { targetRole: "Engineer" },
    });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_analysis_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      analysisId: "analysis-1",
    });
    expect(result.toPrimitives()).toMatchObject({
      id: "analysis-1",
      userId: "user-1",
      cvDocumentId: "cv-1",
      score: null,
      aiContext: { targetRole: "Engineer" },
    });
  });
});
