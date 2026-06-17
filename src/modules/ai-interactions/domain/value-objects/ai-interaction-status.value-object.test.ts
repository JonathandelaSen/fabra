import { describe, expect, it } from "vitest";
import { AIInteractionStatus } from "./ai-interaction-status.value-object";

describe("AIInteractionStatus", () => {
  it("round-trips a value", () => {
    expect(AIInteractionStatus.fromPrimitives("succeeded").toPrimitives()).toBe("succeeded");
  });
});
