import { describe, expect, it } from "vitest";
import { InvalidEntityIdError } from "@/backend/modules/shared";
import { JobMatchAnalysisId } from "./job-match-analysis-id.value-object";

describe("JobMatchAnalysisId", () => {
  it("round-trips non-empty ids", () => {
    expect(JobMatchAnalysisId.fromPrimitives("analysis-1").toPrimitives()).toBe("analysis-1");
  });

  it("rejects blank ids", () => {
    expect(() => JobMatchAnalysisId.fromPrimitives(" ")).toThrow(InvalidEntityIdError);
  });
});
