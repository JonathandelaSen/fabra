import { ValueObject } from "@/modules/shared";
import type {
  CVDocumentPrimitives,
  CVDocumentExtractedTextPrimitives,
} from "../entities/cv-document.entity";

export interface CVAnalysisInputPrimitives {
  cv: CVDocumentPrimitives;
  analysisText: string | null;
  filename: string;
  fileSize: number | null;
  pdfStoragePath: string | null;
  extractedText: CVDocumentExtractedTextPrimitives;
  extractionDiagnostics: {
    filename: string | null;
    fileSize: number | null;
    pythonLength: number;
    pdfjsLength: number;
    nodeLength: number;
    pythonError: boolean;
    pdfjsError: boolean;
    nodeError: boolean;
  };
}

export class CVAnalysisInput extends ValueObject<CVAnalysisInputPrimitives> {
  private constructor(private readonly value: CVAnalysisInputPrimitives) {
    super();
  }

  static fromPrimitives(
    primitives: CVAnalysisInputPrimitives
  ): CVAnalysisInput {
    return new CVAnalysisInput(primitives);
  }

  toPrimitives(): CVAnalysisInputPrimitives {
    return this.value;
  }

  get cv(): CVDocumentPrimitives {
    return this.value.cv;
  }

  get analysisText(): string | null {
    return this.value.analysisText;
  }

  get filename(): string {
    return this.value.filename;
  }

  get fileSize(): number | null {
    return this.value.fileSize;
  }

  get pdfStoragePath(): string | null {
    return this.value.pdfStoragePath;
  }

  get extractedText(): CVDocumentExtractedTextPrimitives {
    return this.value.extractedText;
  }

  get extractionDiagnostics() {
    return this.value.extractionDiagnostics;
  }
}
