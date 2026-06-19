import { describe, expect, it } from "vitest";
import { AIInteractionEntityType } from "./ai-interaction-entity-type.value-object";

describe("AIInteractionEntityType", () => {
  it("round-trips a value", () => {
    expect(AIInteractionEntityType.fromPrimitives("cv").toPrimitives()).toBe("cv");
  });
});
