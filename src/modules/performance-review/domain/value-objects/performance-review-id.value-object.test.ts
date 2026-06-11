import { describe, expect, it } from "vitest";
import { PerformanceReviewId } from "./performance-review-id.value-object";

describe("PerformanceReviewId", () => {
  it("round-trips a value", () => {
    const id = PerformanceReviewId.fromPrimitives("abc");
    expect(id.toPrimitives()).toBe("abc");
  });

  it("rejects empty values", () => {
    expect(() => PerformanceReviewId.fromPrimitives(" ")).toThrow();
  });
});
