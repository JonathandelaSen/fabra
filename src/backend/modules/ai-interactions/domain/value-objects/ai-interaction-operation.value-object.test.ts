import { describe, expect, it } from "vitest";
import { AIInteractionOperation } from "./ai-interaction-operation.value-object";

describe("AIInteractionOperation", () => {
  it("round-trips a value", () => {
    expect(AIInteractionOperation.fromPrimitives("draft").toPrimitives()).toBe("draft");
  });
});
