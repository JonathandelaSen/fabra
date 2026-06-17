import { describe, expect, it } from "vitest";
import { ProcessQuestionRelatedAnalysis } from "./process-question-related-analysis.value-object";

describe("ProcessQuestionRelatedAnalysis", () => {
  it("round-trips full primitives", () => {
    const primitives = {
      id: "analysis-1",
      cv_id: "cv-1",
      title: "Frontend role",
      filename: "cv.pdf",
      analysis_mode: "job_match",
      job_url: "https://example.com/job",
      offer_status: "applied",
    };
    const vo = ProcessQuestionRelatedAnalysis.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
    expect(vo.analysisMode).toBe("job_match");
  });

  it("supports null optional fields", () => {
    const primitives = {
      id: "analysis-2",
      cv_id: null,
      title: "General",
      filename: "cv.pdf",
      analysis_mode: "general",
      job_url: null,
      offer_status: null,
    };
    expect(ProcessQuestionRelatedAnalysis.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
  });
});
