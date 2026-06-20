import { describe, expect, it } from "vitest";
import { ActivityContextHiddenSuggestion } from "./activity-context-hidden-suggestion.value-object";
import { ActivityContextHiddenSuggestions } from "./activity-context-hidden-suggestions.value-object";

describe("ActivityContextHiddenSuggestions", () => {
  it("matches hidden suggestions by normalized key", () => {
    const hidden = ActivityContextHiddenSuggestions.fromPrimitives({
      suggestions: [{ type: "employment", name: "Acme Company" }],
    });

    expect(
      hidden.has(
        ActivityContextHiddenSuggestion.fromPrimitives({
          type: "employment",
          name: " acme   company ",
        })
      )
    ).toBe(true);
    expect(
      hidden.has(
        ActivityContextHiddenSuggestion.fromPrimitives({
          type: "project",
          name: "Acme Company",
        })
      )
    ).toBe(false);
  });
});
