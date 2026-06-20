import { describe, expect, it } from "vitest";
import { JobMatchAnalysisSnapshot } from "./job-match-analysis-snapshot.value-object";

describe("JobMatchAnalysisSnapshot", () => {
  it("round-trips arbitrary snapshots and null", () => {
    const snapshot = { description: "Job", keyData: null };
    expect(
      JobMatchAnalysisSnapshot.fromPrimitives(snapshot).toPrimitives(),
    ).toEqual(snapshot);
    expect(
      JobMatchAnalysisSnapshot.fromPrimitives(null).toPrimitives(),
    ).toBeNull();
  });

  it("returns a copy with the job URL merged", () => {
    const snapshot = JobMatchAnalysisSnapshot.fromPrimitives({
      description: "Job",
    });
    expect(snapshot.withJobUrl("https://example.com").toPrimitives()).toEqual({
      description: "Job",
      url: "https://example.com",
    });
  });
});
