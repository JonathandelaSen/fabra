import { describe, expect, it } from "vitest";
import { AIInteractionProvider } from "./ai-interaction-provider.value-object";

describe("AIInteractionProvider", () => {
  it("round-trips a value", () => {
    expect(AIInteractionProvider.fromPrimitives("gemini").toPrimitives()).toBe("gemini");
  });
});
