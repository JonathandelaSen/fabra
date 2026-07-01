import { Counter, LongText, ValueObject } from "@/backend/modules/shared";
import type { CVDocumentPrimitives } from "../entities/cv-document.entity";
import {
  CVDocumentExtractedText,
  type CVDocumentExtractedTextPrimitives,
} from "./cv-document-extracted-text.value-object";
import {
  CVExtractionDiagnostics,
  type CVExtractionDiagnosticsPrimitives,
} from "./cv-extraction-diagnostics.value-object";
import { CVDocumentSnapshot } from "./cv-document-snapshot.value-object";

export interface CVAnalysisInputPrimitives {
  cv: CVDocumentPrimitives;
  analysisText: string | null;
  filename: string;
  fileSize: number | null;
  pdfStoragePath: string | null;
  extractedText: CVDocumentExtractedTextPrimitives;
  extractionDiagnostics: CVExtractionDiagnosticsPrimitives;
}

export class CVAnalysisInput extends ValueObject<CVAnalysisInputPrimitives> {
  private constructor(
    private readonly cvValue: CVDocumentSnapshot,
    private readonly analysisTextValue: LongText | null,
    private readonly filenameValue: LongText,
    private readonly fileSizeValue: Counter | null,
    private readonly pdfStoragePathValue: LongText | null,
    private readonly extractedTextValue: CVDocumentExtractedText,
    private readonly extractionDiagnosticsValue: CVExtractionDiagnostics,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVAnalysisInputPrimitives,
  ): CVAnalysisInput {
    return new CVAnalysisInput(
      CVDocumentSnapshot.fromPrimitives(primitives.cv),
      primitives.analysisText === null
        ? null
        : LongText.fromPrimitives(primitives.analysisText),
      LongText.fromPrimitives(primitives.filename),
      primitives.fileSize === null
        ? null
        : Counter.fromPrimitives(primitives.fileSize),
      primitives.pdfStoragePath === null
        ? null
        : LongText.fromPrimitives(primitives.pdfStoragePath),
      CVDocumentExtractedText.fromPrimitives(primitives.extractedText),
      CVExtractionDiagnostics.fromPrimitives(primitives.extractionDiagnostics),
    );
  }

  toPrimitives(): CVAnalysisInputPrimitives {
    return {
      cv: this.cvValue.toPrimitives(),
      analysisText: this.analysisTextValue?.toPrimitives() ?? null,
      filename: this.filenameValue.toPrimitives(),
      fileSize: this.fileSizeValue?.toPrimitives() ?? null,
      pdfStoragePath: this.pdfStoragePathValue?.toPrimitives() ?? null,
      extractedText: this.extractedTextValue.toPrimitives(),
      extractionDiagnostics: this.extractionDiagnosticsValue.toPrimitives(),
    };
  }

  get cv(): CVDocumentPrimitives {
    return this.cvValue.toPrimitives();
  }

  get analysisText(): string | null {
    return this.analysisTextValue?.toPrimitives() ?? null;
  }

  get filename(): string {
    return this.filenameValue.toPrimitives();
  }

  get fileSize(): number | null {
    return this.fileSizeValue?.toPrimitives() ?? null;
  }

  get pdfStoragePath(): string | null {
    return this.pdfStoragePathValue?.toPrimitives() ?? null;
  }

  get extractedText(): CVDocumentExtractedTextPrimitives {
    return this.extractedTextValue.toPrimitives();
  }

  get extractionDiagnostics(): CVExtractionDiagnosticsPrimitives {
    return this.extractionDiagnosticsValue.toPrimitives();
  }
}
