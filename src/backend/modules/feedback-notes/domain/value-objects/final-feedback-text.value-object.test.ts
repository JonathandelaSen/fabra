import { describe, expect, it } from "vitest";
import { FinalFeedbackText } from "./final-feedback-text.value-object";

describe("FinalFeedbackText", () => {
  it("round-trips its primitive value", () => {
    const text = FinalFeedbackText.fromPrimitives("Great work");
    expect(text.toPrimitives()).toBe("Great work");
  });

  it("rejects empty values", () => {
    expect(() => FinalFeedbackText.fromPrimitives("   ")).toThrow();
  });
});
