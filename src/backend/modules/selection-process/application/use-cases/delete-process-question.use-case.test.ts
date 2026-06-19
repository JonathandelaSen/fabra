import { describe, expect, it } from "vitest";
import { ExecutionResult } from "@/backend/modules/shared";
import { DeleteProcessQuestionUseCase } from "./delete-process-question.use-case";
import { processQuestionRepo, eventBus } from "./selection-process-test-helpers.test";

describe("DeleteProcessQuestionUseCase", () => {
  it("deletes a process question", async () => {
    const repo = processQuestionRepo();
    const bus = eventBus();
    const deleted = await new DeleteProcessQuestionUseCase({
      questionRepo: repo,
      eventBus: bus,
    }).execute({ id: "question-1", userId: "user-1" });

    expect(deleted).toBeInstanceOf(ExecutionResult);
    expect(deleted.toPrimitives()).toBe(true);
    expect(repo.delete).toHaveBeenCalledOnce();

    expect(bus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = bus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("process_question_deleted");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      questionId: "question-1",
    });
  });
});
