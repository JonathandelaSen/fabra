import { describe, expect, it } from "vitest";
import { AIInteractionModule } from "./ai-interaction-module.value-object";

describe("AIInteractionModule", () => {
  it("round-trips a value", () => {
    expect(AIInteractionModule.fromPrimitives("work-journal").toPrimitives()).toBe("work-journal");
  });
});
