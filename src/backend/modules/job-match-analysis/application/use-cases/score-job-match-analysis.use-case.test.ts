import { describe, expect, it, vi } from "vitest";
import { JobMatchAnalysis } from "../../domain/entities/job-match-analysis.entity";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import type {
  JobMatchScoringAIServiceFactory,
  JobMatchScoringAIService,
} from "../../domain/repositories/job-match-scoring-ai.service";
import { JobMatchScoringAIResultVO } from "../../domain/value-objects/job-match-scoring-ai-result.value-object";
import { ScoreJobMatchAnalysisUseCase } from "./score-job-match-analysis.use-case";

function makeAnalysis(
  overrides?: Partial<ReturnType<JobMatchAnalysis["toPrimitives"]>>,
) {
  return JobMatchAnalysis.fromPrimitives({
    id: "analysis-1",
    userId: "user-1",
    cvDocumentId: "cv-1",
    cvStructuredProfileId: null,
    jobOpportunityId: null,
    title: "Job Match",
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
    ...overrides,
  });
}

function makeMockAIServiceFactory(
  result = {
    score: 72,
    feedback: "Good match",
    aiKeywords: ["react"],
    improvements: ["add testing"],
    jobKeyData: { title: "Frontend Dev" },
    jobKeywords: ["react", "testing"],
    cvKeywords: ["react"],
    matchingKeywords: ["react"],
    missingKeywords: ["testing"],
  },
): JobMatchScoringAIServiceFactory {
  const service: JobMatchScoringAIService = {
    score: vi.fn(async () => JobMatchScoringAIResultVO.fromPrimitives(result)),
  };
  return { create: vi.fn(() => service) };
}

describe("ScoreJobMatchAnalysisUseCase", () => {
  it("scores an analysis and persists the result with job snapshot", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () => makeAnalysis()),
      save: vi.fn(async (a) => a),
      delete: vi.fn(),
    } satisfies JobMatchAnalysisRepository;
    const factory = makeMockAIServiceFactory();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new ScoreJobMatchAnalysisUseCase({
      repo,
      aiServiceFactory: factory,
      eventBus: eventBus as never,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      provider: "mock",
      apiKey: "key",
      model: "gemini-test",
      jobDescription: "Looking for a frontend dev",
      jobUrl: "https://example.com/job",
    });

    expect(factory.create).toHaveBeenCalledWith({
      provider: "mock",
      apiKey: "key",
      model: "gemini-test",
    });
    const primitives = result?.toPrimitives();
    expect(primitives).toMatchObject({
      score: 72,
      feedback: "Good match",
      aiKeywords: ["react"],
      missingKeywords: ["testing"],
    });
    expect(primitives?.jobSnapshot).toMatchObject({
      description: "Looking for a frontend dev",
      url: "https://example.com/job",
    });
    expect(primitives?.analyzedAt).toBeTruthy();
    expect(eventBus.publish).toHaveBeenCalledTimes(4);
    const publishedEvents = eventBus.publish.mock.calls[2][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("job_match_analysis_scored");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      analysisId: "analysis-1",
      score: 72,
      aiModel: "gemini-test",
    });
  });

  it("returns null when analysis not found", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () => null),
      save: vi.fn(),
      delete: vi.fn(),
    } satisfies JobMatchAnalysisRepository;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new ScoreJobMatchAnalysisUseCase({
      repo,
      aiServiceFactory: makeMockAIServiceFactory(),
      eventBus: eventBus as never,
    }).execute({
      id: "missing",
      userId: "user-1",
      provider: "mock",
      apiKey: "key",
      model: "model",
      jobDescription: "desc",
      jobUrl: null,
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
    } satisfies JobMatchAnalysisRepository;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    await expect(
      new ScoreJobMatchAnalysisUseCase({
        repo,
        aiServiceFactory: makeMockAIServiceFactory(),
        eventBus: eventBus as never,
      }).execute({
        id: "analysis-1",
        userId: "user-1",
        provider: "mock",
        apiKey: "key",
        model: "model",
        jobDescription: "desc",
        jobUrl: null,
      }),
    ).rejects.toThrow("No extracted text");
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
