import { describe, expect, it } from "vitest";
import { JobMatchAnalysisExtractedText } from "./job-match-analysis-extracted-text.value-object";

describe("JobMatchAnalysisExtractedText", () => {
  it("round-trips extracted text primitives", () => {
    const primitives = {
      textPython: "python text",
      textPdfjs: null,
      textNode: "node text",
      extractErrorPython: null,
      extractErrorPdfjs: "pdfjs error",
      extractErrorNode: null,
    };

    expect(
      JobMatchAnalysisExtractedText.fromPrimitives(primitives).toPrimitives(),
    ).toEqual(primitives);
  });
});
