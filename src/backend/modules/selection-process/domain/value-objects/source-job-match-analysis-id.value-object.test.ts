import { describe, expect, it } from "vitest";
import { SourceJobMatchAnalysisId } from "./source-job-match-analysis-id.value-object";

describe("SourceJobMatchAnalysisId", () => {
  it("round-trips primitives", () => {
    expect(
      SourceJobMatchAnalysisId.fromPrimitives("analysis-1").toPrimitives(),
    ).toBe("analysis-1");
  });

  it("rejects blank values", () => {
    expect(() => SourceJobMatchAnalysisId.fromPrimitives(" ")).toThrow("empty");
  });
});
