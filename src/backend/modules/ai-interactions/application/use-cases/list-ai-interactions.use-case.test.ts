import { describe, expect, it, vi } from "vitest";
import { AIInteractionEvent } from "../../domain/entities/ai-interaction-event.entity";
import { ListAIInteractionsUseCase } from "./list-ai-interactions.use-case";

describe("ListAIInteractionsUseCase", () => {
  it("groups lifecycle events into interactions", async () => {
    const base = {
      id: "event-1", interactionId: "interaction-1", attemptId: "attempt-1", userId: "user-1",
      module: "cv_analysis", operation: "score_cv", entityType: "cv_analysis", entityId: "analysis-1",
      assistanceMode: "integrated", provider: "mock", model: "mock-model",
      occurredAt: "2026-06-13T10:00:00.000Z", createdAt: "2026-06-13T10:00:00.000Z",
    };
    const events = [
      AIInteractionEvent.create({ ...base, eventName: "ai_runtime.prompt_prepared", payload: { prompt: "hello", promptVersion: "1" } }),
      AIInteractionEvent.create({
        ...base,
        id: "event-2",
        eventName: "ai_runtime.request_sent",
        occurredAt: "2026-06-13T10:00:01.000Z",
        payload: {},
      }),
    ];
    const useCase = new ListAIInteractionsUseCase({
      eventRepository: { save: vi.fn(), searchByUser: vi.fn(async () => events) },
      reviewRepository: { save: vi.fn(), searchByReviewer: vi.fn(async () => []) },
    });
    const result = await useCase.execute("user-1");
    expect(result[0]).toMatchObject({
      interactionId: "interaction-1",
      prompt: "hello",
      promptVersion: "1",
      eventNames: ["ai_runtime.prompt_prepared", "ai_runtime.request_sent"],
    });
  });
});
