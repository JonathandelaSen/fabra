import { describe, expect, it, vi } from "vitest";
import { CVAnalysis } from "../../domain/entities/cv-analysis.entity";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";
import { UpdateCVAnalysisAIResultUseCase } from "./update-cv-analysis-ai-result.use-case";

function makeAnalysis() {
  return CVAnalysis.fromPrimitives({
    id: "analysis-1",
    userId: "user-1",
    cvDocumentId: "cv-1",
    cvStructuredProfileId: null,
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
    aiModel: null,
    score: null,
    feedback: null,
    keywords: [],
    improvements: [],
    aiContext: null,
    analyzedAt: null,
    legacyAnalysisId: null,
    createdAt: "2026-05-13T10:00:00.000Z",
    updatedAt: "2026-05-13T10:00:00.000Z",
  });
}

describe("UpdateCVAnalysisAIResultUseCase", () => {
  it("stores AI result fields on an existing CV analysis", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () => makeAnalysis()),
      save: vi.fn(async (analysis) => analysis),
      delete: vi.fn(),
    } satisfies CVAnalysisRepository;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new UpdateCVAnalysisAIResultUseCase({ repo, eventBus: eventBus as never }).execute({
      id: "analysis-1",
      userId: "user-1",
      aiModel: "model",
      aiContext: null,
      score: 82,
      feedback: "Good",
      keywords: ["ts"],
      improvements: ["metrics"],
    });

    expect(result?.toPrimitives()).toMatchObject({
      score: 82,
      feedback: "Good",
      keywords: ["ts"],
      improvements: ["metrics"],
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    expect(eventBus.publish.mock.calls[0][0][0].eventName).toBe("cv_analysis_scored");
  });

  it("returns null when the analysis does not exist", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () => null),
      save: vi.fn(),
      delete: vi.fn(),
    } satisfies CVAnalysisRepository;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    await expect(
      new UpdateCVAnalysisAIResultUseCase({ repo, eventBus: eventBus as never }).execute({
        id: "missing",
        userId: "user-1",
        aiModel: "model",
        aiContext: null,
        score: 10,
        feedback: "No",
        keywords: [],
        improvements: [],
      }),
    ).resolves.toBeNull();
    expect(repo.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
