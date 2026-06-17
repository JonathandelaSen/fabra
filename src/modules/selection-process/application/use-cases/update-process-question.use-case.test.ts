import { describe, expect, it } from "vitest";
import { UpdateProcessQuestionUseCase } from "./update-process-question.use-case";
import {
  processQuestion,
  processQuestionRepo,
  readModel,
  eventBus,
} from "./selection-process-test-helpers.test";

describe("UpdateProcessQuestionUseCase", () => {
  it("updates question fields and publishes event", async () => {
    const repo = processQuestionRepo();
    const bus = eventBus();
    const result = await new UpdateProcessQuestionUseCase({
      questionRepo: repo,
      eventBus: bus,
    }).execute({
      id: "question-1",
      userId: "user-1",
      question: "Tell me about yourself",
      answer: "Answer",
      aiModel: "gemini",
      aiGeneratedAt: "2026-05-13T11:00:00.000Z",
    });

    expect(result?.question.toPrimitives()).toMatchObject({
      question: "Tell me about yourself",
      answer: "Answer",
      aiModel: "gemini",
    });

    expect(bus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = bus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("process_question_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      questionId: result?.question.id,
      fields: ["question", "answer", "aiModel", "aiGeneratedAt"],
    });
  });

  it("returns null when the question does not exist", async () => {
    const repo = processQuestionRepo({ findById: async () => null });
    const bus = eventBus();
    const result = await new UpdateProcessQuestionUseCase({
      questionRepo: repo,
      eventBus: bus,
    }).execute({ id: "missing", userId: "user-1", answer: "Nope" });

    expect(result).toBeNull();
  });

  it("keeps unspecified fields", async () => {
    const existing = readModel({ question: processQuestion({ context: "old" }).toPrimitives() });
    const repo = processQuestionRepo({ findById: async () => existing });
    const bus = eventBus();
    const result = await new UpdateProcessQuestionUseCase({
      questionRepo: repo,
      eventBus: bus,
    }).execute({ id: "question-1", userId: "user-1", answer: "new" });

    expect(result?.question.toPrimitives()).toMatchObject({
      context: "old",
      answer: "new",
    });
  });
});
