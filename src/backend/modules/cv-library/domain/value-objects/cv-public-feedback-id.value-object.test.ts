import { describe, expect, it } from "vitest";
import { CVPublicFeedbackId } from "./cv-public-feedback-id.value-object";

describe("CVPublicFeedbackId", () => {
  it("round-trips primitives", () => {
    expect(CVPublicFeedbackId.fromPrimitives("feedback-1").toPrimitives()).toBe(
      "feedback-1",
    );
  });

  it("rejects blank values", () => {
    expect(() => CVPublicFeedbackId.fromPrimitives(" ")).toThrow("empty");
  });
});
