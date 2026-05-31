import { describe, expect, it } from "vitest";
import type { JobMatchAnalysisSummary } from "../api/job-match-analysis-api";
import {
  buildJobMatchKanbanColumns,
  getJobMatchKanbanStatus,
} from "./job-match-kanban-utils";

function analysis(
  overrides: Partial<JobMatchAnalysisSummary> & Pick<JobMatchAnalysisSummary, "id">,
): JobMatchAnalysisSummary {
  return {
    id: overrides.id,
    cvId: null,
    title: overrides.title ?? `Analysis ${overrides.id}`,
    filename: overrides.filename ?? `${overrides.id}.pdf`,
    createdAt: overrides.createdAt ?? "2026-01-01T10:00:00.000Z",
    aiScore: overrides.aiScore ?? null,
    aiAnalyzedAt: null,
    jobUrl: null,
    offerStatus: overrides.offerStatus ?? null,
    offerNextActionAt: overrides.offerNextActionAt ?? null,
  };
}

describe("job-match-kanban-utils", () => {
  it("treats missing offer status as interesting", () => {
    expect(getJobMatchKanbanStatus(analysis({ id: "analysis-1" }))).toBe(
      "interesting",
    );
  });

  it("groups analyses into offer status columns", () => {
    const columns = buildJobMatchKanbanColumns([
      analysis({ id: "job-1", offerStatus: "applied" }),
      analysis({ id: "job-2", offerStatus: "interview" }),
      analysis({ id: "job-3", offerStatus: null }),
    ]);

    expect(columns.applied.map((item) => item.id)).toEqual(["job-1"]);
    expect(columns.interview.map((item) => item.id)).toEqual(["job-2"]);
    expect(columns.interesting.map((item) => item.id)).toEqual(["job-3"]);
  });

  it("sorts each column by next action, score, then creation date", () => {
    const columns = buildJobMatchKanbanColumns([
      analysis({
        id: "recent-low-score",
        aiScore: 20,
        createdAt: "2026-01-04T10:00:00.000Z",
      }),
      analysis({
        id: "older-high-score",
        aiScore: 90,
        createdAt: "2026-01-02T10:00:00.000Z",
      }),
      analysis({
        id: "next-action-later",
        aiScore: 10,
        offerNextActionAt: "2026-02-02T10:00:00.000Z",
      }),
      analysis({
        id: "next-action-first",
        aiScore: 5,
        offerNextActionAt: "2026-02-01T10:00:00.000Z",
      }),
    ]);

    expect(columns.interesting.map((item) => item.id)).toEqual([
      "next-action-first",
      "next-action-later",
      "older-high-score",
      "recent-low-score",
    ]);
  });
});
