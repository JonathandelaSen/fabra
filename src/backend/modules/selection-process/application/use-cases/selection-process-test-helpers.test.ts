import { ProcessQuestionReadModel, type ProcessQuestionRelatedCVPrimitives, type ProcessQuestionRelatedAnalysisPrimitives } from "../../domain/value-objects/process-question-read-model.value-object";
import { describe, expect, it, vi } from "vitest";

import { ProcessQuestion } from "../../domain/entities/process-question.entity";
import type {
  ProcessQuestionRepository,
} from "../../domain/repositories/process-question.repository";

export const now = "2026-05-13T10:00:00.000Z";

export function processQuestion(
  overrides: Partial<ReturnType<ProcessQuestion["toPrimitives"]>> = {}
) {
  return ProcessQuestion.fromPrimitives({
    id: "question-1",
    userId: "user-1",
    jobOpportunityId: "job-1",
    question: "Why us?",
    context: "I like the product",
    answer: null,
    aiModel: null,
    aiGeneratedAt: null,
    sourceJobMatchAnalysisId: "analysis-1",
    legacyInterviewQuestionId: "question-1",
    legacyCvId: "cv-1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
}

import type { ProcessQuestionReadModelPrimitives } from "../../domain/value-objects/process-question-read-model.value-object";

export function readModel(
  overrides: Partial<ProcessQuestionReadModelPrimitives> = {}
): ProcessQuestionReadModel {
  return ProcessQuestionReadModel.fromPrimitives({
    question: processQuestion().toPrimitives(),
    cv: { id: "cv-1", name: "CV", filename: "cv.pdf", type: "uploaded" },
    analysis: {
      id: "analysis-1",
      cv_id: "cv-1",
      title: "Offer",
      filename: "cv.pdf",
      analysis_mode: "job_match",
      job_url: null,
      offer_status: "interesting",
    },
    ...overrides,
  });
}

export function processQuestionRepo(
  overrides: Partial<ProcessQuestionRepository> = {}
) {
  return {
    search: vi.fn(async () => [readModel()]),
    findById: vi.fn(async () => readModel()),
    save: vi.fn(async (question: ProcessQuestion) => readModel({ question: question.toPrimitives() })),
    delete: vi.fn(async () => true),
    ...overrides,
  } satisfies ProcessQuestionRepository;
}

export function eventBus() {
  return { publish: vi.fn().mockResolvedValue(undefined) };
}

describe("selection-process test helpers", () => {
  it("creates a process question fixture", () => {
    expect(processQuestion().id).toBe("question-1");
  });
});
