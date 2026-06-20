import { ValueObject } from "@/backend/modules/shared";
import { JobMatchAnalysisOptionalText } from "./job-match-analysis-optional-text.value-object";

export interface JobMatchAnalysisExtractedTextPrimitives {
  textPython: string | null;
  textPdfjs: string | null;
  textNode: string | null;
  extractErrorPython: string | null;
  extractErrorPdfjs: string | null;
  extractErrorNode: string | null;
}

export class JobMatchAnalysisExtractedText extends ValueObject<JobMatchAnalysisExtractedTextPrimitives> {
  private constructor(
    private readonly textPythonValue: JobMatchAnalysisOptionalText,
    private readonly textPdfjsValue: JobMatchAnalysisOptionalText,
    private readonly textNodeValue: JobMatchAnalysisOptionalText,
    private readonly extractErrorPythonValue: JobMatchAnalysisOptionalText,
    private readonly extractErrorPdfjsValue: JobMatchAnalysisOptionalText,
    private readonly extractErrorNodeValue: JobMatchAnalysisOptionalText,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: JobMatchAnalysisExtractedTextPrimitives,
  ): JobMatchAnalysisExtractedText {
    return new JobMatchAnalysisExtractedText(
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.textPython),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.textPdfjs),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.textNode),
      JobMatchAnalysisOptionalText.fromPrimitives(
        primitives.extractErrorPython,
      ),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.extractErrorPdfjs),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.extractErrorNode),
    );
  }

  toPrimitives(): JobMatchAnalysisExtractedTextPrimitives {
    return {
      textPython: this.textPythonValue.toPrimitives(),
      textPdfjs: this.textPdfjsValue.toPrimitives(),
      textNode: this.textNodeValue.toPrimitives(),
      extractErrorPython: this.extractErrorPythonValue.toPrimitives(),
      extractErrorPdfjs: this.extractErrorPdfjsValue.toPrimitives(),
      extractErrorNode: this.extractErrorNodeValue.toPrimitives(),
    };
  }
}
