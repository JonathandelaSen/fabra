import { describe, expect, it } from "vitest";
import {
  getJobMatchAnalysisHref,
  parseJobMatchAnalysisRoute,
} from "./use-job-match-analysis-route-state";

describe("job match analysis route state", () => {
  it("treats /job-analyses/new as the new offer flow", () => {
    expect(parseJobMatchAnalysisRoute("/job-analyses/new")).toMatchObject({
      mode: "new",
      view: "list",
      analysisId: null,
      isAnalysisView: false,
    });
  });

  it("builds a stable href for the new offer flow", () => {
    expect(getJobMatchAnalysisHref({ mode: "new" })).toBe("/job-analyses/new");
  });
});
