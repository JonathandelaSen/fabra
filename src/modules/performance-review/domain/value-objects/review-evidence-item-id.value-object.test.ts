import { describe, expect, it } from "vitest";
import { ReviewEvidenceItemId } from "./review-evidence-item-id.value-object";

describe("ReviewEvidenceItemId", () => {
  it("round-trips a value", () => {
    expect(ReviewEvidenceItemId.fromPrimitives("x").toPrimitives()).toBe("x");
  });

  it("rejects empty values", () => {
    expect(() => ReviewEvidenceItemId.fromPrimitives("")).toThrow();
  });
});
