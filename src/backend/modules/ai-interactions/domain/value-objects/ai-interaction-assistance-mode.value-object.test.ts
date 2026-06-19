import { describe, expect, it } from "vitest";
import { AIInteractionAssistanceMode } from "./ai-interaction-assistance-mode.value-object";

describe("AIInteractionAssistanceMode", () => {
  it("round-trips a value", () => {
    expect(AIInteractionAssistanceMode.fromPrimitives("integrated").toPrimitives()).toBe("integrated");
  });
});
