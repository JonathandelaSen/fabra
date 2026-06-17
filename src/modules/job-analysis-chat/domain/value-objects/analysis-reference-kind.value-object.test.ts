import { describe, expect, it } from "vitest";
import { AnalysisReferenceKind } from "./analysis-reference-kind.value-object";

describe("AnalysisReferenceKind", () => {
  it("round-trips supported types", () => {
    expect(AnalysisReferenceKind.fromPrimitives("job_match_analysis").toPrimitives()).toBe("job_match_analysis");
    expect(AnalysisReferenceKind.fromPrimitives("cv_analysis").toPrimitives()).toBe("cv_analysis");
  });

  it("rejects unsupported types", () => {
    expect(() => AnalysisReferenceKind.fromPrimitives("other")).toThrow();
  });
});
