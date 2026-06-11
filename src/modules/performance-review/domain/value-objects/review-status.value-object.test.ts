import { describe, expect, it } from "vitest";
import { ReviewStatus } from "./review-status.value-object";

describe("ReviewStatus", () => {
  it("accepts known statuses", () => {
    expect(ReviewStatus.fromPrimitives("prepared").toPrimitives()).toBe(
      "prepared",
    );
  });

  it("rejects unknown statuses", () => {
    expect(() => ReviewStatus.fromPrimitives("bogus")).toThrow();
  });
});
