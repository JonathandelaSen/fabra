import { describe, expect, it } from "vitest";
import { ActivityContextSuggestionSource } from "./activity-context-suggestion-source.value-object";

describe("ActivityContextSuggestionSource", () => {
  it("round-trips the cv source", () => {
    expect(ActivityContextSuggestionSource.fromPrimitives("cv").toPrimitives()).toBe("cv");
  });

  it("rejects unknown sources", () => {
    expect(() => ActivityContextSuggestionSource.fromPrimitives("manual")).toThrow();
  });
});
