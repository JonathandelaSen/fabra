import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectCVAnalysis,
  shouldShowCVAnalysisMainLoader,
} from "./cv-analysis-loading-state";

describe("cv analysis loading state", () => {
  it("does not auto-select while the list query is in flight", () => {
    expect(
      shouldAutoSelectCVAnalysis({
        analysisCount: 2,
        isResolvingList: true,
        mode: "list",
        selectedAnalysisId: null,
      })
    ).toBe(false);
  });

  it("keeps the main pane on a loader while replacing the root URL with the first analysis id", () => {
    expect(
      shouldShowCVAnalysisMainLoader({
        analysisCount: 2,
        isResolvingDetail: false,
        isResolvingList: false,
        mode: "list",
        selectedAnalysisId: null,
      })
    ).toBe(true);
  });

  it("does not hide the new analysis flow behind the list loader", () => {
    expect(
      shouldShowCVAnalysisMainLoader({
        analysisCount: 2,
        isResolvingDetail: false,
        isResolvingList: true,
        mode: "new",
        selectedAnalysisId: null,
      })
    ).toBe(false);
  });
});
