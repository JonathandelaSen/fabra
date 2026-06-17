import { describe, expect, it } from "vitest";
import { CVScoreCopyPastePreview } from "./cv-score-copy-paste-preview.value-object";

describe("CVScoreCopyPastePreview", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      score: 90,
      summary: "Good CV",
      strengthsCount: 3,
      improvementAreasCount: 2,
      recommendationsCount: 1,
      originLabel: "external_chat" as const,
      willReplaceExistingResult: false,
    };
    const vo = CVScoreCopyPastePreview.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
