import { describe, expect, it } from "vitest";
import { CVScorePreview } from "./cv-score-preview.value-object";

describe("CVScorePreview", () => {
  it("can be created from primitives and round-trips correctly", () => {
    const primitives = {
      parsedResult: {
        score: 85,
        feedback: "Good",
        keywords: ["react"],
        improvements: ["add typescript"],
      },
      preview: {
        score: 85,
        summary: "Good",
        strengthsCount: 1,
        improvementAreasCount: 1,
        recommendationsCount: 1,
        originLabel: "external_chat" as const,
        willReplaceExistingResult: false,
      },
      warnings: ["warning-1"],
    };
    const vo = CVScorePreview.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
