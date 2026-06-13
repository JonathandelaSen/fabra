import { describe, expect, it, vi } from "vitest";
import { CVAnalysis } from "../../domain/entities/cv-analysis.entity";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";
import type {
  CVScoringAIServiceFactory,
  CVScoringAIService,
} from "../../domain/repositories/cv-scoring-ai.service";
import { ScoreCVAnalysisUseCase } from "./score-cv-analysis.use-case";

function makeAnalysis(overrides?: Partial<ReturnType<CVAnalysis["toPrimitives"]>>) {
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
      textPython: "some extracted text",
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
    ...overrides,
  });
}

function makeMockAIServiceFactory(result = {
  score: 85,
  feedback: "Good CV",
  keywords: ["typescript"],
  improvements: ["add metrics"],
}): CVScoringAIServiceFactory {
  const service: CVScoringAIService = {
    score: vi.fn(async () => result),
  };
  return { create: vi.fn(() => service) };
}

describe("ScoreCVAnalysisUseCase", () => {
  it("scores an analysis and persists the result", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () => makeAnalysis()),
      save: vi.fn(async (a) => a),
      delete: vi.fn(),
    } satisfies CVAnalysisRepository;
    const factory = makeMockAIServiceFactory();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new ScoreCVAnalysisUseCase({
      repo,
      aiServiceFactory: factory,
      eventBus: eventBus as never,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      provider: "mock",
      apiKey: "key",
      model: "gemini-test",
      additionalContext: "I am a senior dev",
    });

    expect(factory.create).toHaveBeenCalledWith({
      provider: "mock",
      apiKey: "key",
      model: "gemini-test",
    });
    expect(result?.toPrimitives()).toMatchObject({
      score: 85,
      feedback: "Good CV",
      keywords: ["typescript"],
      improvements: ["add metrics"],
      aiContext: { additionalContext: "I am a senior dev" },
    });
    expect(result?.toPrimitives().analyzedAt).toBeTruthy();
    const publishedEvents = eventBus.publish.mock.calls.flatMap(([events]) => events);
    expect(publishedEvents.map((event) => event.eventName)).toEqual([
      "ai_runtime.prompt_prepared",
      "ai_runtime.request_sent",
      "ai_runtime.response_validated",
      "cv_analysis_scored",
      "ai_runtime.result_applied",
    ]);
    const scoredEvent = publishedEvents.find(
      (event) => event.eventName === "cv_analysis_scored",
    );
    expect(scoredEvent?.toPrimitives()).toEqual({
      analysisId: "analysis-1",
      score: 85,
      aiModel: "gemini-test",
    });
  });

  it("returns null when analysis not found", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () => null),
      save: vi.fn(),
      delete: vi.fn(),
    } satisfies CVAnalysisRepository;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new ScoreCVAnalysisUseCase({
      repo,
      aiServiceFactory: makeMockAIServiceFactory(),
      eventBus: eventBus as never,
    }).execute({
      id: "missing",
      userId: "user-1",
      provider: "mock",
      apiKey: "key",
      model: "model",
    });

    expect(result).toBeNull();
    expect(repo.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("throws when no extracted text available", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () =>
        makeAnalysis({
          extractedText: {
            textPython: null,
            textPdfjs: null,
            textNode: null,
            extractErrorPython: null,
            extractErrorPdfjs: null,
            extractErrorNode: null,
          },
        }),
      ),
      save: vi.fn(),
      delete: vi.fn(),
    } satisfies CVAnalysisRepository;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    await expect(
      new ScoreCVAnalysisUseCase({
        repo,
        aiServiceFactory: makeMockAIServiceFactory(),
        eventBus: eventBus as never,
      }).execute({
        id: "analysis-1",
        userId: "user-1",
        provider: "mock",
        apiKey: "key",
        model: "model",
      }),
    ).rejects.toThrow("No extracted text");
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
