import type { AnalysisSummary } from "@/lib/analysis-types";
import { describe, expect, it } from "vitest";
import { AnalysisSummaries } from "./analysis-summaries.value-object";

const analysis: AnalysisSummary = {
  id: "analysis-1",
  cv_id: "cv-1",
  title: "Analysis",
  filename: "cv.pdf",
  created_at: "2026-05-13T10:00:00.000Z",
  analysis_mode: "general",
  ai_score: null,
  ai_analyzed_at: null,
  job_url: null,
  offer_status: null,
  offer_next_action_at: null,
};

describe("AnalysisSummaries", () => {
  it("round-trips values and primitives", () => {
    const summaries = AnalysisSummaries.fromValues([analysis]);

    expect(summaries.toValues()).toEqual([analysis]);
    expect(
      AnalysisSummaries.fromPrimitives(summaries.toPrimitives()).toPrimitives(),
    ).toEqual([analysis]);
  });

  it("returns defensive copies", () => {
    const summaries = AnalysisSummaries.fromValues([analysis]);
    const values = summaries.toValues();
    values[0].title = "Changed";

    expect(summaries.toValues()[0].title).toBe("Analysis");
  });
});
