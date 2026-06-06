import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectJobMatchAnalysis,
  shouldShowJobMatchAnalysisMainLoader,
} from "./job-match-analysis-loading-state";

describe("job match analysis loading state", () => {
  it("does not auto-select while the initial offer list is still pending", () => {
    expect(
      shouldAutoSelectJobMatchAnalysis({
        analysisCount: 0,
        analysisId: null,
        isListPending: true,
        mode: "list",
        pathname: "/job-analyses",
        view: "list",
      })
    ).toBe(false);
  });

  it("auto-selects from cached offers during a background refetch", () => {
    expect(
      shouldAutoSelectJobMatchAnalysis({
        analysisCount: 2,
        analysisId: null,
        isListPending: false,
        mode: "list",
        pathname: "/job-analyses",
        view: "list",
      })
    ).toBe(true);
  });

  it("does not auto-select outside the list view/route", () => {
    expect(
      shouldAutoSelectJobMatchAnalysis({
        analysisCount: 2,
        analysisId: null,
        isListPending: false,
        mode: "list",
        pathname: "/job-analyses",
        view: "kanban",
      })
    ).toBe(false);
  });

  it("keeps the main pane on a loader while replacing the root URL with the first offer id", () => {
    expect(
      shouldShowJobMatchAnalysisMainLoader({
        analysisCount: 2,
        analysisId: null,
        isDetailPending: false,
        isListPending: false,
        mode: "list",
        pathname: "/job-analyses",
        view: "list",
      })
    ).toBe(true);
  });

  it("does not flash the loader during a background list refetch with an offer selected", () => {
    expect(
      shouldShowJobMatchAnalysisMainLoader({
        analysisCount: 2,
        analysisId: "a",
        isDetailPending: false,
        isListPending: false,
        mode: "detail",
        pathname: "/job-analyses/a",
        view: "list",
      })
    ).toBe(false);
  });

  it("regression: keeps the loader on right after auto-selecting an offer, before its detail loads (no empty-state flash)", () => {
    expect(
      shouldShowJobMatchAnalysisMainLoader({
        analysisCount: 2,
        analysisId: "a",
        isDetailPending: true,
        isListPending: false,
        mode: "detail",
        pathname: "/job-analyses/a",
        view: "list",
      })
    ).toBe(true);
  });

  it("regression: never shows the empty state while offers exist and nothing is selected yet, even when the route is mid-transition and not recognized as the canonical list route", () => {
    expect(
      shouldShowJobMatchAnalysisMainLoader({
        analysisCount: 2,
        analysisId: null,
        isDetailPending: false,
        isListPending: false,
        mode: "list",
        pathname: "/job-analyses/pending-redirect",
        view: "list",
      })
    ).toBe(true);
  });

  it("does not hide the new offer flow behind the list loader", () => {
    expect(
      shouldShowJobMatchAnalysisMainLoader({
        analysisCount: 0,
        analysisId: null,
        isDetailPending: false,
        isListPending: true,
        mode: "new",
        pathname: "/job-analyses/new",
        view: "list",
      })
    ).toBe(false);
  });
});
