import { describe, expect, it } from "vitest";
import { JobMatchScoringAIResultVO } from "./job-match-scoring-ai-result.value-object";

describe("JobMatchScoringAIResultVO", () => {
  it("can be created from primitives and round-trips correctly", () => {
    const primitives = {
      score: 85,
      feedback: "Good",
      aiKeywords: ["react"],
      improvements: ["add typescript"],
      jobKeyData: null,
      jobKeywords: ["react", "typescript"],
      cvKeywords: ["react"],
      matchingKeywords: ["react"],
      missingKeywords: ["typescript"],
    };
    const vo = JobMatchScoringAIResultVO.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
