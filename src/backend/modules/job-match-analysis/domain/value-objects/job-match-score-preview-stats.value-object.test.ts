import { describe, expect, it } from "vitest";
import { JobMatchScorePreviewStats } from "./job-match-score-preview-stats.value-object";

describe("JobMatchScorePreviewStats", () => {
  it("can be created from primitives and round-trips correctly", () => {
    const primitives = {
      score: 75,
      summary: "Some summary",
      matchingKeywordsCount: 3,
      missingKeywordsCount: 2,
      jobKeywordsCount: 5,
      recommendationsCount: 4,
      originLabel: "external_chat" as const,
      willReplaceExistingResult: false,
    };
    const vo = JobMatchScorePreviewStats.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
