import { describe, expect, it } from "vitest";
import { CreateProcessQuestionUseCase } from "./create-process-question.use-case";
import { processQuestionRepo, eventBus } from "./selection-process-test-helpers.test";

describe("CreateProcessQuestionUseCase", () => {
  it("creates a process question and publishes event", async () => {
    const repo = processQuestionRepo();
    const bus = eventBus();
    const result = await new CreateProcessQuestionUseCase({
      questionRepo: repo,
      eventBus: bus,
    }).execute({
      userId: "user-1",
      question: "Why us?",
      context: "Because",
      answer: null,
      legacyCvId: "cv-1",
      sourceJobMatchAnalysisId: "analysis-1",
    });

    expect(result.question.toPrimitives()).toMatchObject({
      question: "Why us?",
      legacyCvId: "cv-1",
      sourceJobMatchAnalysisId: "analysis-1",
    });

    expect(bus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = bus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("process_question_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      questionId: result.question.id,
    });
  });
});
