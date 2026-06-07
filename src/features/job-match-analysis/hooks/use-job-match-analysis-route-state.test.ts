import { describe, expect, it } from "vitest";
import {
  getJobMatchAnalysisHref,
  parseJobMatchAnalysisRoute,
  shouldShowJobMatchAnalysisView,
} from "./use-job-match-analysis-route-state";

describe("shouldShowJobMatchAnalysisView", () => {
  it("defaults to AI analysis when a score exists", () => {
    expect(
      shouldShowJobMatchAnalysisView({
        hasScore: true,
        isAnalysisView: false,
        isExplicitExtractionView: false,
      }),
    ).toBe(true);
  });

  it("respects an explicit extraction selection", () => {
    expect(
      shouldShowJobMatchAnalysisView({
        hasScore: true,
        isAnalysisView: false,
        isExplicitExtractionView: true,
      }),
    ).toBe(false);
  });
});

describe("parseJobMatchAnalysisRoute", () => {
  it("treats the list root as the list view with no selection", () => {
    expect(parseJobMatchAnalysisRoute("/job-analyses")).toMatchObject({
      mode: "list",
      view: "list",
      analysisId: null,
      isAnalysisView: false,
    });
  });

  it("treats /job-analyses/new as the new offer flow, not a detail id", () => {
    expect(parseJobMatchAnalysisRoute("/job-analyses/new")).toMatchObject({
      mode: "new",
      view: "list",
      analysisId: null,
      isAnalysisView: false,
    });
  });

  it("reads the offer id from the first segment in the list view", () => {
    expect(parseJobMatchAnalysisRoute("/job-analyses/offer-1")).toMatchObject({
      mode: "detail",
      view: "list",
      analysisId: "offer-1",
      isAnalysisView: false,
    });
  });

  it("flags the analysis sub-view when the second segment is 'analysis'", () => {
    expect(
      parseJobMatchAnalysisRoute("/job-analyses/offer-1/analysis"),
    ).toMatchObject({
      mode: "detail",
      view: "list",
      analysisId: "offer-1",
      isAnalysisView: true,
    });
  });

  it("keeps the kanban view with no selection on the board root", () => {
    expect(parseJobMatchAnalysisRoute("/job-analyses/kanban")).toMatchObject({
      mode: "list",
      view: "kanban",
      analysisId: null,
      isAnalysisView: false,
    });
  });

  it("reads the offer id from the second segment in the kanban view", () => {
    expect(
      parseJobMatchAnalysisRoute("/job-analyses/kanban/offer-2"),
    ).toMatchObject({
      mode: "detail",
      view: "kanban",
      analysisId: "offer-2",
      isAnalysisView: false,
    });
  });

  it("flags the analysis sub-view in kanban when the third segment is 'analysis'", () => {
    expect(
      parseJobMatchAnalysisRoute("/job-analyses/kanban/offer-2/analysis"),
    ).toMatchObject({
      mode: "detail",
      view: "kanban",
      analysisId: "offer-2",
      isAnalysisView: true,
    });
  });

  it("decodes percent-encoded ids so domain code sees the raw id", () => {
    expect(
      parseJobMatchAnalysisRoute("/job-analyses/offer%2Fwith%20space"),
    ).toMatchObject({
      analysisId: "offer/with space",
    });
  });

  it("does not match unrelated paths that merely share a prefix", () => {
    expect(parseJobMatchAnalysisRoute("/job-analyses-archive")).toMatchObject({
      mode: "list",
      view: "list",
      analysisId: null,
      isAnalysisView: false,
    });
  });
});

describe("getJobMatchAnalysisHref", () => {
  it("returns the list root when no id is given", () => {
    expect(getJobMatchAnalysisHref({})).toBe("/job-analyses");
  });

  it("returns the kanban root when the kanban view has no id", () => {
    expect(getJobMatchAnalysisHref({ view: "kanban" })).toBe(
      "/job-analyses/kanban",
    );
  });

  it("always routes the new flow to /job-analyses/new regardless of other params", () => {
    expect(
      getJobMatchAnalysisHref({ mode: "new", id: "offer-1", view: "kanban" }),
    ).toBe("/job-analyses/new");
  });

  it("links to the extraction detail when analysis is not requested", () => {
    expect(getJobMatchAnalysisHref({ id: "offer-1" })).toBe(
      "/job-analyses/offer-1",
    );
  });

  it("marks extraction explicitly when the user selects it", () => {
    expect(
      getJobMatchAnalysisHref({ id: "offer-1", extraction: true }),
    ).toBe("/job-analyses/offer-1?view=extraction");
  });

  it("omits the tab query string for the default summary tab", () => {
    expect(getJobMatchAnalysisHref({ id: "offer-1", analysis: true })).toBe(
      "/job-analyses/offer-1/analysis",
    );
  });

  it("adds the tab query string for non-summary tabs", () => {
    expect(
      getJobMatchAnalysisHref({ id: "offer-1", analysis: true, tab: "chat" }),
    ).toBe("/job-analyses/offer-1/analysis?tab=chat");
  });

  it("encodes ids so a slash in the id does not create extra path segments", () => {
    expect(getJobMatchAnalysisHref({ id: "offer/1" })).toBe(
      "/job-analyses/offer%2F1",
    );
  });
});

describe("route parse/href round trip", () => {
  it("re-parses every href the builder produces back to the same view, id, and analysis flag", () => {
    const cases = [
      { id: "offer-1", analysis: false, view: "list" as const },
      { id: "offer-1", analysis: true, view: "list" as const },
      { id: "offer-2", analysis: false, view: "kanban" as const },
      { id: "offer-2", analysis: true, view: "kanban" as const },
      { id: "offer/with space", analysis: true, view: "list" as const },
    ];

    for (const input of cases) {
      const href = getJobMatchAnalysisHref(input);
      const pathname = href.split("?")[0];
      const parsed = parseJobMatchAnalysisRoute(pathname);

      expect(parsed.view).toBe(input.view);
      expect(parsed.analysisId).toBe(input.id);
      expect(parsed.isAnalysisView).toBe(input.analysis);
    }
  });
});
