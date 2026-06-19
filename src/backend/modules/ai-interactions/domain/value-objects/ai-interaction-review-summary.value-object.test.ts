import { describe, expect, it } from "vitest";
import { AIInteractionReviewSummary } from "./ai-interaction-review-summary.value-object";

describe("AIInteractionReviewSummary", () => {
  it("round-trips rating and note", () => {
    const primitives = { rating: "mixed", note: "Some feedback" };
    const vo = AIInteractionReviewSummary.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
    expect(vo.ratingValue).toBe("mixed");
    expect(vo.noteValue).toBe("Some feedback");
  });

  it("supports a null note", () => {
    const vo = AIInteractionReviewSummary.fromPrimitives({ rating: "good", note: null });
    expect(vo.noteValue).toBeNull();
    expect(vo.toPrimitives()).toEqual({ rating: "good", note: null });
  });

  it("rejects an invalid rating", () => {
    expect(() => AIInteractionReviewSummary.fromPrimitives({ rating: "nope", note: null })).toThrow();
  });
});
