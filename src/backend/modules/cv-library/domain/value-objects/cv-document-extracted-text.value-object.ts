import { LongText, ValueObject } from "@/backend/modules/shared";

export interface CVDocumentExtractedTextPrimitives {
  textPython: string | null;
  textPdfjs: string | null;
  textNode: string | null;
  extractErrorPython: string | null;
  extractErrorPdfjs: string | null;
  extractErrorNode: string | null;
}

export class CVDocumentExtractedText extends ValueObject<CVDocumentExtractedTextPrimitives> {
  private constructor(
    private readonly textPythonValue: LongText | null,
    private readonly textPdfjsValue: LongText | null,
    private readonly textNodeValue: LongText | null,
    private readonly extractErrorPythonValue: LongText | null,
    private readonly extractErrorPdfjsValue: LongText | null,
    private readonly extractErrorNodeValue: LongText | null,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVDocumentExtractedTextPrimitives,
  ): CVDocumentExtractedText {
    const toText = (value: string | null) =>
      value === null ? null : LongText.fromPrimitives(value);
    return new CVDocumentExtractedText(
      toText(primitives.textPython),
      toText(primitives.textPdfjs),
      toText(primitives.textNode),
      toText(primitives.extractErrorPython),
      toText(primitives.extractErrorPdfjs),
      toText(primitives.extractErrorNode),
    );
  }

  toPrimitives(): CVDocumentExtractedTextPrimitives {
    return {
      textPython: this.textPythonValue?.toPrimitives() ?? null,
      textPdfjs: this.textPdfjsValue?.toPrimitives() ?? null,
      textNode: this.textNodeValue?.toPrimitives() ?? null,
      extractErrorPython: this.extractErrorPythonValue?.toPrimitives() ?? null,
      extractErrorPdfjs: this.extractErrorPdfjsValue?.toPrimitives() ?? null,
      extractErrorNode: this.extractErrorNodeValue?.toPrimitives() ?? null,
    };
  }
}
