import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectJobMatchAnalysis,
  shouldShowJobMatchAnalysisMainLoader,
} from "./job-match-analysis-loading-state";

describe("job match analysis loading state", () => {
  it("does not auto-select while the offer list query is in flight", () => {
    expect(
      shouldAutoSelectJobMatchAnalysis({
        analysisCount: 2,
        analysisId: null,
        isResolvingList: true,
        mode: "list",
        pathname: "/job-analyses",
        view: "list",
      })
    ).toBe(false);
  });

  it("keeps the main pane on a loader while replacing the root URL with the first offer id", () => {
    expect(
      shouldShowJobMatchAnalysisMainLoader({
        analysisCount: 2,
        analysisId: null,
        isResolvingDetail: false,
        isResolvingList: false,
        mode: "list",
        pathname: "/job-analyses",
        view: "list",
      })
    ).toBe(true);
  });

  it("does not hide the new offer flow behind the list loader", () => {
    expect(
      shouldShowJobMatchAnalysisMainLoader({
        analysisCount: 2,
        analysisId: null,
        isResolvingDetail: false,
        isResolvingList: true,
        mode: "new",
        pathname: "/job-analyses/new",
        view: "list",
      })
    ).toBe(false);
  });
});
