import type { AnalysisSummary } from "@/lib/analysis-types";
import { describe, expect, it } from "vitest";
import { CVDeletionOutcome } from "./cv-deletion-outcome.value-object";

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

describe("CVDeletionOutcome", () => {
  it("builds a deleted result with no analyses", () => {
    const result = CVDeletionOutcome.deleted();

    expect(result.status.isDeleted()).toBe(true);
    expect(result.analyses).toEqual([]);
    expect(result.toPrimitives()).toEqual({ status: "deleted", analyses: [] });
  });

  it("builds a not_found result with no analyses", () => {
    const result = CVDeletionOutcome.notFound();

    expect(result.status.isNotFound()).toBe(true);
    expect(result.analyses).toEqual([]);
  });

  it("builds an in_use result carrying the blocking analyses", () => {
    const result = CVDeletionOutcome.inUse([analysis]);

    expect(result.status.isInUse()).toBe(true);
    expect(result.analyses).toEqual([analysis]);
  });

  it("round-trips through primitives", () => {
    const primitives = { status: "in_use" as const, analyses: [analysis] };

    expect(
      CVDeletionOutcome.fromPrimitives(primitives).toPrimitives()
    ).toEqual(primitives);
  });
});
