import { describe, expect, it } from "vitest";
import { ActivityContextHiddenSuggestion } from "./activity-context-hidden-suggestion.value-object";

describe("ActivityContextHiddenSuggestion", () => {
  it("round-trips primitives and builds a normalized key", () => {
    const suggestion = ActivityContextHiddenSuggestion.fromPrimitives({
      type: "project",
      name: " Hidden   Project ",
    });

    expect(suggestion.toPrimitives()).toEqual({
      type: "project",
      name: "Hidden   Project",
    });
    expect(suggestion.key()).toBe("project:hidden project");
    expect(suggestion.nameKey()).toBe("hidden project");
  });
});
