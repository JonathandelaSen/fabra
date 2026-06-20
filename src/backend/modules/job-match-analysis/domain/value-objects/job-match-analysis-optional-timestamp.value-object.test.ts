import { describe, expect, it } from "vitest";
import { JobMatchAnalysisOptionalTimestamp } from "./job-match-analysis-optional-timestamp.value-object";

describe("JobMatchAnalysisOptionalTimestamp", () => {
  it("round-trips timestamps and null", () => {
    expect(
      JobMatchAnalysisOptionalTimestamp.fromPrimitives(
        "2026-05-13T10:00:00.000Z",
      ).toPrimitives(),
    ).toBe("2026-05-13T10:00:00.000Z");
    expect(
      JobMatchAnalysisOptionalTimestamp.fromPrimitives(null).toPrimitives(),
    ).toBeNull();
  });

  it("rejects blank timestamps when present", () => {
    expect(() => JobMatchAnalysisOptionalTimestamp.fromPrimitives(" ")).toThrow(
      "Job match analysis timestamp cannot be empty when present.",
    );
  });
});
