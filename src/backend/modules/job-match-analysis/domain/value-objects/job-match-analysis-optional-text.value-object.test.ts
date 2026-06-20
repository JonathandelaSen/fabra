import { describe, expect, it } from "vitest";
import { JobMatchAnalysisOptionalText } from "./job-match-analysis-optional-text.value-object";

describe("JobMatchAnalysisOptionalText", () => {
  it("round-trips text and null", () => {
    expect(
      JobMatchAnalysisOptionalText.fromPrimitives("value").toPrimitives(),
    ).toBe("value");
    expect(
      JobMatchAnalysisOptionalText.fromPrimitives(null).toPrimitives(),
    ).toBeNull();
  });
});
