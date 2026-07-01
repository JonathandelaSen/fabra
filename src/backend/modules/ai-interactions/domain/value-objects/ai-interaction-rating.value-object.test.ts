import { describe, expect, it } from "vitest";
import { AIInteractionRating, InvalidAIInteractionRatingError } from "./ai-interaction-rating.value-object";

describe("AIInteractionRating", () => {
  it("round-trips a valid rating", () => {
    expect(AIInteractionRating.fromPrimitives("good").toPrimitives()).toBe("good");
  });

  it("rejects an invalid rating", () => {
    expect(() => AIInteractionRating.fromPrimitives("great")).toThrow(InvalidAIInteractionRatingError);
  });
});
