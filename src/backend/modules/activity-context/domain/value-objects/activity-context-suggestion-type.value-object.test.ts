import { describe, expect, it } from "vitest";
import { ActivityContextSuggestionType, InvalidActivityContextSuggestionTypeError } from "./activity-context-suggestion-type.value-object";

describe("ActivityContextSuggestionType", () => {
  it("round-trips a valid type", () => {
    expect(ActivityContextSuggestionType.fromPrimitives("employment").toPrimitives()).toBe("employment");
  });

  it("rejects unknown types", () => {
    expect(() => ActivityContextSuggestionType.fromPrimitives("nope")).toThrow(InvalidActivityContextSuggestionTypeError);
  });
});
