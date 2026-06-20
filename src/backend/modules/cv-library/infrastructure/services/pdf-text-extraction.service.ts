import { getErrorMessage } from "@/lib/errors";
import { CVDocumentExtractedText } from "../../domain/value-objects/cv-document-extracted-text.value-object";
import type {
  CVPdfTextExtractionContext,
  CVPdfTextExtractor,
} from "../../domain/repositories/cv-analysis-preparation-services";
import type { PdfParsers } from "./pdf-parsers.service";

type ParserResponse = {
  text?: string | null;
  error?: string | null;
};

export class PdfTextExtractionService implements CVPdfTextExtractor {
  constructor(private readonly pdfParsers: PdfParsers) {}

  async extract(
    buffer: Buffer,
    context: CVPdfTextExtractionContext,
  ): Promise<CVDocumentExtractedText> {
    const parserResult = await this.pdfParsers.extract(buffer);
    const parserPrimitives = parserResult.toPrimitives();
    let text_python: string | null = null;
    let extract_error_python: string | null = null;

    try {
      const parsedOut = await this.extractWithPythonService(context);
      text_python = parsedOut.text || null;
      extract_error_python = parsedOut.error || null;
    } catch (e: unknown) {
      extract_error_python = getErrorMessage(e);
    }

    return CVDocumentExtractedText.fromPrimitives({
      textPython: text_python,
      textPdfjs: parserPrimitives.textPdfjs,
      textNode: parserPrimitives.textNode,
      extractErrorPython: extract_error_python,
      extractErrorPdfjs: parserPrimitives.extractErrorPdfjs,
      extractErrorNode: parserPrimitives.extractErrorNode,
    });
  }

  private async extractWithPythonService(
    context: CVPdfTextExtractionContext,
  ): Promise<ParserResponse> {
    if (!context?.pdfStoragePath) {
      return { error: "Missing PDF storage path for Python parser service." };
    }

    const parserUrl = process.env.PYTHON_PARSER_URL?.replace(/\/+$/, "");
    const parserSecret = process.env.PYTHON_PARSER_SECRET;

    if (!parserUrl || !parserSecret) {
      return { error: "Python parser service is not configured." };
    }

    const controller = new AbortController();
    const timeoutMs = Number(process.env.PYTHON_PARSER_TIMEOUT_MS ?? 15000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${parserUrl}/extract`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${parserSecret}`,
        },
        body: JSON.stringify({
          bucket: "cv-pdfs",
          storagePath: context.pdfStoragePath,
          cvId: context.cvId,
          requestId: context.requestId,
        }),
        signal: controller.signal,
      });

      const body = (await response.json().catch(() => ({}))) as ParserResponse;

      if (!response.ok) {
        return {
          error:
            body.error ||
            `Python parser service returned HTTP ${response.status}.`,
        };
      }

      return {
        text: body.text || null,
        error: body.error || null,
      };
    } catch (error: unknown) {
      return { error: getErrorMessage(error) };
    } finally {
      clearTimeout(timeout);
    }
  }
}
