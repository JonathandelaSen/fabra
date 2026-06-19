import { describe, expect, it } from "vitest";
import { JobMatchScorePreview } from "./job-match-score-preview.value-object";

describe("JobMatchScorePreview", () => {
  it("can be created from primitives and round-trips correctly", () => {
    const primitives = {
      parsedResult: {
        score: 85,
        feedback: "Good",
        aiKeywords: ["react"],
        improvements: ["add typescript"],
        jobKeyData: null,
        jobKeywords: ["react", "typescript"],
        cvKeywords: ["react"],
        matchingKeywords: ["react"],
        missingKeywords: ["typescript"],
      },
      preview: {
        score: 85,
        summary: "Good",
        matchingKeywordsCount: 1,
        missingKeywordsCount: 1,
        jobKeywordsCount: 2,
        recommendationsCount: 1,
        originLabel: "external_chat" as const,
        willReplaceExistingResult: false,
      },
      warnings: ["warning-1"],
    };
    const vo = JobMatchScorePreview.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
