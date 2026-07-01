import { describe, expect, it } from "vitest";
import { JobMatchAnalysisOptionalCounter, InvalidJobMatchAnalysisCounterError } from "./job-match-analysis-optional-counter.value-object";

describe("JobMatchAnalysisOptionalCounter", () => {
  it("round-trips counts and null", () => {
    expect(
      JobMatchAnalysisOptionalCounter.fromPrimitives(42).toPrimitives(),
    ).toBe(42);
    expect(
      JobMatchAnalysisOptionalCounter.fromPrimitives(null).toPrimitives(),
    ).toBeNull();
  });

  it("rejects negative counts", () => {
    expect(() => JobMatchAnalysisOptionalCounter.fromPrimitives(-1)).toThrow(
      InvalidJobMatchAnalysisCounterError,
    );
  });
});
