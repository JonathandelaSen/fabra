import { describe, expect, it, vi } from "vitest";
import type { AIInteractionEventRepository } from "../../domain/repositories/ai-interaction-event.repository";
import { RecordAIInteractionEventUseCase } from "./record-ai-interaction-event.use-case";

describe("RecordAIInteractionEventUseCase", () => {
  it("creates and saves an AI interaction event entity", async () => {
    const repository = {
      save: vi.fn(async (event) => event),
      searchByUser: vi.fn(),
    } satisfies AIInteractionEventRepository;
    const useCase = new RecordAIInteractionEventUseCase({ repository });

    const saved = await useCase.execute({
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

    expect(repository.save).toHaveBeenCalledOnce();
    expect(saved.toPrimitives().interactionId).toBe("interaction-1");
  });
});
