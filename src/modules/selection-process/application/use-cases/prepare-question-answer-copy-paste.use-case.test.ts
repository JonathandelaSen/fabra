import { describe, expect, it, vi } from "vitest";
import { Timestamp, UserId } from "@/modules/shared";
import { ProcessQuestion } from "../../domain/entities/process-question.entity";
import type { ProcessQuestionRepository } from "../../domain/repositories/process-question.repository";
import { ProcessQuestionId } from "../../domain/value-objects/process-question-id.value-object";
import { ProcessQuestionText } from "../../domain/value-objects/process-question-text.value-object";
import { PrepareQuestionAnswerCopyPasteUseCase } from "./prepare-question-answer-copy-paste.use-case";

function createQuestion(overrides?: { answer?: string | null }) {
  return ProcessQuestion.create({
    id: ProcessQuestionId.fromPrimitives("q-1"),
    userId: UserId.fromPrimitives("user-1"),
    jobOpportunityId: null,
    question: ProcessQuestionText.fromPrimitives("Why should we hire you?"),
    context: "I have 5 years of React experience",
    answer: overrides?.answer ?? null,
    aiModel: null,
    aiGeneratedAt: null,
    sourceJobMatchAnalysisId: "analysis-1",
    legacyInterviewQuestionId: null,
    legacyCvId: "cv-1",
    createdAt: Timestamp.fromPrimitives("2026-05-01T10:00:00.000Z"),
    updatedAt: Timestamp.fromPrimitives("2026-05-01T10:00:00.000Z"),
  });
}

function readModel(overrides?: { answer?: string | null }) {
  return {
    question: createQuestion(overrides),
    cv: { id: "cv-1", name: "CV principal", filename: "cv.pdf", type: "uploaded" as const },
    analysis: {
      id: "analysis-1",
      cv_id: "cv-1",
      title: "Frontend role",
      filename: "cv.pdf",
      analysis_mode: "job_match" as const,
      job_url: null,
      offer_status: null,
    },
  };
}

describe("PrepareQuestionAnswerCopyPasteUseCase", () => {
  it("builds a generate prompt with question context and linked data", async () => {
    const questionRepo: ProcessQuestionRepository = {
      search: vi.fn(),
      findById: vi.fn(async () => readModel()),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const result = await new PrepareQuestionAnswerCopyPasteUseCase({
      questionRepo,
    }).execute({
      id: "q-1",
      userId: "user-1",
      mode: "generate",
      cv: { name: "CV principal", type: "uploaded" } as never,
      cvText: "React experience for 5 years",
      analysis: { title: "Frontend role", job_description: "React role" } as never,
      requestId: "req-1",
    });

    expect(result).toMatchObject({
      workflowId: "interview_question.answer",
      schemaVersion: "1",
      expectedResponse: { kind: "plain_text" },
    });
    expect(result!.prompt).toContain("Why should we hire you?");
    expect(result!.prompt).toContain("5 years of React experience");
    expect(result!.prompt).toContain("plain text");
    expect(result!.prompt).not.toContain("Return ONLY valid JSON");
  });

  it("includes current answer and instruction in edit mode", async () => {
    const questionRepo: ProcessQuestionRepository = {
      search: vi.fn(),
      findById: vi.fn(async () => readModel({ answer: "Existing answer" })),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const result = await new PrepareQuestionAnswerCopyPasteUseCase({
      questionRepo,
    }).execute({
      id: "q-1",
      userId: "user-1",
      mode: "edit",
      instruction: "Make it shorter",
      requestId: "req-2",
    });

    expect(result!.prompt).toContain("Existing answer");
    expect(result!.prompt).toContain("Make it shorter");
  });

  it("returns null when question is not found", async () => {
    const questionRepo: ProcessQuestionRepository = {
      search: vi.fn(),
      findById: vi.fn(async () => null),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const result = await new PrepareQuestionAnswerCopyPasteUseCase({
      questionRepo,
    }).execute({
      id: "q-missing",
      userId: "user-1",
      mode: "generate",
      requestId: "req-3",
    });

    expect(result).toBeNull();
  });
});
