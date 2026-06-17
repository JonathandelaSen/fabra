import { describe, expect, it } from "vitest";
import { ActivityContextSuggestionName } from "./activity-context-suggestion-name.value-object";

describe("ActivityContextSuggestionName", () => {
  it("trims and round-trips a value", () => {
    expect(ActivityContextSuggestionName.fromPrimitives("  Lead role  ").toPrimitives()).toBe("Lead role");
  });

  it("rejects empty values", () => {
    expect(() => ActivityContextSuggestionName.fromPrimitives("   ")).toThrow();
  });
});
