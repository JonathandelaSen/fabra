import { describe, expect, it } from "vitest";
import { ExtractCVUploadTextUseCase } from "./extract-cv-upload-text.use-case";
import { CVDocumentExtractedText } from "../../domain/value-objects/cv-document-extracted-text.value-object";

describe("ExtractCVUploadTextUseCase", () => {
  it("delegates extraction to the text extractor port", async () => {
    const extracted = CVDocumentExtractedText.fromPrimitives({
      textPython: "from python",
      textPdfjs: null,
      textNode: null,
      extractErrorPython: null,
      extractErrorPdfjs: null,
      extractErrorNode: null,
    });
    const calls: Array<{ buffer: Buffer; context: unknown }> = [];
    const textExtractor = {
      extract: async (buffer: Buffer, context: unknown) => {
        calls.push({ buffer, context });
        return extracted;
      },
    };
    const useCase = new ExtractCVUploadTextUseCase({ textExtractor });

    const buffer = Buffer.from("%PDF");
    const context = { userId: "u1", cvId: "c1", requestId: "r1" };
    const result = await useCase.execute({ buffer, context });

    expect(result).toBe(extracted);
    expect(calls).toEqual([{ buffer, context }]);
  });
});
