import { describe, expect, it } from "vitest";
import { ReviewType, InvalidReviewTypeError } from "./review-type.value-object";

describe("ReviewType", () => {
  it("accepts known types", () => {
    expect(ReviewType.fromPrimitives("promotion_case").toPrimitives()).toBe(
      "promotion_case",
    );
  });

  it("rejects unknown types", () => {
    expect(() => ReviewType.fromPrimitives("bogus")).toThrow(InvalidReviewTypeError);
  });
});
