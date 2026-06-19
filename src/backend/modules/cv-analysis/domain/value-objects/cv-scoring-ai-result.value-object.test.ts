import { describe, expect, it } from "vitest";
import { CVScoringAIResultVO } from "./cv-scoring-ai-result.value-object";

describe("CVScoringAIResultVO", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      score: 85,
      feedback: "Great CV!",
      keywords: ["typescript", "react"],
      improvements: ["add more achievements"],
    };
    const vo = CVScoringAIResultVO.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
