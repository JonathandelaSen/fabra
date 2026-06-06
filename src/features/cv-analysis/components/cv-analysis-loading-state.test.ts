import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectCVAnalysis,
  shouldShowCVAnalysisMainLoader,
} from "./cv-analysis-loading-state";

describe("cv analysis loading state", () => {
  it("does not auto-select while the initial list load is pending", () => {
    expect(
      shouldAutoSelectCVAnalysis({
        analysisCount: 0,
        isListPending: true,
        mode: "list",
        selectedAnalysisId: null,
      })
    ).toBe(false);
  });

  it("auto-selects from cached analyses during a background refetch", () => {
    expect(
      shouldAutoSelectCVAnalysis({
        analysisCount: 2,
        isListPending: false,
        mode: "list",
        selectedAnalysisId: null,
      })
    ).toBe(true);
  });

  it("keeps the main pane on a loader while replacing the root URL with the first analysis id", () => {
    expect(
      shouldShowCVAnalysisMainLoader({
        analysisCount: 2,
        isDetailPending: false,
        isListPending: false,
        mode: "list",
        selectedAnalysisId: null,
      })
    ).toBe(true);
  });

  it("does not show the main loader during a background list refetch once a detail is resolved", () => {
    expect(
      shouldShowCVAnalysisMainLoader({
        analysisCount: 2,
        isDetailPending: false,
        isListPending: false,
        mode: "list",
        selectedAnalysisId: "a",
      })
    ).toBe(false);
  });

  it("does not hide the new analysis flow behind the list loader", () => {
    expect(
      shouldShowCVAnalysisMainLoader({
        analysisCount: 0,
        isDetailPending: false,
        isListPending: true,
        mode: "new",
        selectedAnalysisId: null,
      })
    ).toBe(false);
  });
});
