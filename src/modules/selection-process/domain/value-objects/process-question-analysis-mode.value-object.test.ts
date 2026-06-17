import { describe, expect, it } from "vitest";
import { ProcessQuestionAnalysisModeVO } from "./process-question-analysis-mode.value-object";

describe("ProcessQuestionAnalysisModeVO", () => {
  it("round-trips valid modes", () => {
    expect(ProcessQuestionAnalysisModeVO.fromPrimitives("general").toPrimitives()).toBe("general");
    expect(ProcessQuestionAnalysisModeVO.fromPrimitives("job_match").toPrimitives()).toBe("job_match");
  });

  it("rejects an invalid mode", () => {
    expect(() => ProcessQuestionAnalysisModeVO.fromPrimitives("other")).toThrow();
  });
});
