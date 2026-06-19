import { describe, expect, it } from "vitest";
import { AIInteractionEvent } from "./ai-interaction-event.entity";

describe("AIInteractionEvent", () => {
  it("creates and serializes an AI interaction event", () => {
    const event = AIInteractionEvent.create({
      id: "event-1",
      interactionId: "interaction-1",
      attemptId: "attempt-1",
      eventName: "ai_runtime.prompt_prepared",
      userId: "user-1",
      module: "cv_analysis",
      operation: "score_cv",
      entityType: "cv_analysis",
      entityId: "analysis-1",
      assistanceMode: "integrated",
      provider: "mock",
      model: "mock-model",
      payload: { prompt: "hello" },
      occurredAt: "2026-06-13T10:00:00.000Z",
      createdAt: "2026-06-13T10:00:00.000Z",
    });

    expect(event.toPrimitives()).toMatchObject({
      id: "event-1",
      interactionId: "interaction-1",
      eventName: "ai_runtime.prompt_prepared",
      payload: { prompt: "hello" },
    });
  });
});
