import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/backend/modules/shared";
import { ProcessQuestion } from "./process-question.entity";
import { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";
import { ProcessQuestionId } from "../value-objects/process-question-id.value-object";
import { ProcessQuestionText } from "../value-objects/process-question-text.value-object";

const now = "2026-05-13T10:00:00.000Z";

describe("ProcessQuestion", () => {
  it("creates and answers a process question", () => {
    const question = ProcessQuestion.create({
      id: ProcessQuestionId.fromPrimitives("question-1"),
      userId: UserId.fromPrimitives("user-1"),
      jobOpportunityId: JobOpportunityId.fromPrimitives("job-1"),
      question: ProcessQuestionText.fromPrimitives("Why us?"),
      context: "I like the product",
      answer: null,
      aiModel: null,
      aiGeneratedAt: null,
      sourceJobMatchAnalysisId: "analysis-1",
      legacyInterviewQuestionId: null,
      legacyCvId: null,
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    question.updateAnswer({
      answer: "Because the product solves a real problem.",
      aiModel: "gemini",
      aiGeneratedAt: "2026-05-13T11:00:00.000Z",
      updatedAt: Timestamp.fromPrimitives("2026-05-13T11:00:00.000Z"),
    });

    expect(question.toPrimitives()).toMatchObject({
      question: "Why us?",
      answer: "Because the product solves a real problem.",
      aiModel: "gemini",
    });
  });

  const buildQuestion = () =>
    ProcessQuestion.create({
      id: ProcessQuestionId.fromPrimitives("question-1"),
      userId: UserId.fromPrimitives("user-1"),
      jobOpportunityId: JobOpportunityId.fromPrimitives("job-1"),
      question: ProcessQuestionText.fromPrimitives("Why us?"),
      context: "I like the product",
      answer: null,
      aiModel: null,
      aiGeneratedAt: null,
      sourceJobMatchAnalysisId: "analysis-1",
      legacyInterviewQuestionId: null,
      legacyCvId: null,
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

  it("records a created event on create", () => {
    const events = buildQuestion().pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["process_question_created"]);
    expect(events[0].toPrimitives()).toEqual({ questionId: "question-1" });
  });

  it("records an answered event when an AI answer is set", () => {
    const question = buildQuestion();
    question.pullDomainEvents();

    question.updateAnswer({
      answer: "Because the product solves a real problem.",
      aiModel: "gemini",
      aiGeneratedAt: "2026-05-13T11:00:00.000Z",
      updatedAt: Timestamp.fromPrimitives("2026-05-13T11:00:00.000Z"),
    });
    const events = question.pullDomainEvents();

    expect(events.map((e) => e.eventName)).toEqual(["process_question_answered"]);
    expect(events[0].toPrimitives()).toEqual({ questionId: "question-1", aiGenerated: true });
  });

  it("does not record an answered event when the answer is cleared", () => {
    const question = buildQuestion();
    question.pullDomainEvents();

    question.updateAnswer({
      answer: null,
      aiModel: null,
      aiGeneratedAt: null,
      updatedAt: Timestamp.fromPrimitives("2026-05-13T11:00:00.000Z"),
    });

    expect(question.pullDomainEvents()).toEqual([]);
  });

  it("records an updated event with changed fields", () => {
    const question = buildQuestion();
    question.pullDomainEvents();

    question.update({
      question: ProcessQuestionText.fromPrimitives("Why this team?"),
      updatedAt: Timestamp.fromPrimitives("2026-05-13T11:00:00.000Z"),
    });
    const events = question.pullDomainEvents();

    expect(events.map((e) => e.eventName)).toEqual(["process_question_updated"]);
    expect(events[0].toPrimitives()).toEqual({ questionId: "question-1", fields: ["question"] });
  });

  it("does not record events when hydrated from primitives", () => {
    const hydrated = ProcessQuestion.fromPrimitives(buildQuestion().toPrimitives());
    expect(hydrated.pullDomainEvents()).toEqual([]);
  });
});
