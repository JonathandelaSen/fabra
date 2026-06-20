import { describe, expect, it } from "vitest";
import { CVDocumentExtractedText } from "./cv-document-extracted-text.value-object";

describe("CVDocumentExtractedText", () => {
  it("round-trips primitives", () => {
    const primitives = {
      textPython: "from python",
      textPdfjs: "",
      textNode: null,
      extractErrorPython: null,
      extractErrorPdfjs: "pdfjs failed",
      extractErrorNode: null,
    };
    const vo = CVDocumentExtractedText.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
