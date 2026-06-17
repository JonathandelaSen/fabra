import { describe, expect, it } from "vitest";
import { AIInteractionReadModel } from "./ai-interaction-read-model.value-object";

describe("AIInteractionReadModel", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      interactionId: "i-1",
      module: "m-1",
      operation: "op-1",
      entityType: "e-1",
      entityId: "eid-1",
      assistanceMode: "mode-1",
      provider: "p-1",
      model: "model-1",
      status: "status-1",
      eventNames: ["event-1"],
      occurredAt: "2026-06-17T00:00:00.000Z",
      prompt: "prompt-1",
      promptHash: "hash-1",
      promptVersion: "v1",
      rawResponse: "resp-1",
      parsedResult: { x: 1 },
      error: "err-1",
      durationMs: 100,
      review: { rating: "good" as const, note: "note-1" },
    };
    const vo = AIInteractionReadModel.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
    expect(vo.interactionId).toBe("i-1");
    expect(vo.review?.rating).toBe("good");
  });
});
