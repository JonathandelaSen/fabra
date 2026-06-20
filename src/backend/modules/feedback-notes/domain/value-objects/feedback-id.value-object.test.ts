import { describe, expect, it } from "vitest";
import { FeedbackId } from "./feedback-id.value-object";

describe("FeedbackId", () => {
  it("round-trips primitives", () => {
    expect(FeedbackId.fromPrimitives("feedback-1").toPrimitives()).toBe(
      "feedback-1",
    );
  });

  it("rejects blank values", () => {
    expect(() => FeedbackId.fromPrimitives(" ")).toThrow("empty");
  });
});
