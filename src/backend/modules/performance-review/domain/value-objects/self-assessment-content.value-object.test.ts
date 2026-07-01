import { describe, expect, it } from "vitest";
import { SelfAssessmentContent, InvalidSelfAssessmentContentError } from "./self-assessment-content.value-object";

describe("SelfAssessmentContent", () => {
  it("round-trips its primitive value", () => {
    const content = SelfAssessmentContent.fromPrimitives("Did great things");
    expect(content.toPrimitives()).toBe("Did great things");
  });

  it("rejects empty values", () => {
    expect(() => SelfAssessmentContent.fromPrimitives("  ")).toThrow(InvalidSelfAssessmentContentError);
  });
});
