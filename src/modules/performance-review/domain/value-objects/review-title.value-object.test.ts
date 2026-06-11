import { describe, expect, it } from "vitest";
import { ReviewTitle } from "./review-title.value-object";

describe("ReviewTitle", () => {
  it("trims surrounding whitespace", () => {
    expect(ReviewTitle.fromPrimitives("  H1  ").toPrimitives()).toBe("H1");
  });

  it("rejects empty titles", () => {
    expect(() => ReviewTitle.fromPrimitives("   ")).toThrow();
  });
});
