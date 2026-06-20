import { CVDocumentExtractedText } from "../../domain/value-objects/cv-document-extracted-text.value-object";
import type {
  CVPdfTextExtractionContext,
  CVPdfTextExtractor,
} from "../../domain/repositories/cv-analysis-preparation-services";

export interface ExtractCVUploadTextInput {
  buffer: Buffer;
  context: CVPdfTextExtractionContext;
}

export class ExtractCVUploadTextUseCase {
  constructor(private readonly deps: { textExtractor: CVPdfTextExtractor }) {}

  async execute(input: ExtractCVUploadTextInput): Promise<CVDocumentExtractedText> {
    return this.deps.textExtractor.extract(input.buffer, input.context);
  }
}
