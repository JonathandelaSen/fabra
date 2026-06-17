import { describe, expect, it } from "vitest";
import { AIInteractionModel } from "./ai-interaction-model.value-object";

describe("AIInteractionModel", () => {
  it("round-trips a value", () => {
    expect(AIInteractionModel.fromPrimitives("claude-opus-4-8").toPrimitives()).toBe("claude-opus-4-8");
  });
});
