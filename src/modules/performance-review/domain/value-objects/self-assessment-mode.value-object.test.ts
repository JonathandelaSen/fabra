import { describe, expect, it } from "vitest";
import { SelfAssessmentMode } from "./self-assessment-mode.value-object";

describe("SelfAssessmentMode", () => {
  it("accepts known modes", () => {
    expect(SelfAssessmentMode.fromPrimitives("copy_paste").toPrimitives()).toBe(
      "copy_paste",
    );
  });

  it("rejects unknown modes", () => {
    expect(() => SelfAssessmentMode.fromPrimitives("bogus")).toThrow();
  });
});
