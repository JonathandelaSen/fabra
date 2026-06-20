import { getErrorMessage } from "@/lib/errors";
import { CVDocumentExtractedText } from "../../domain/value-objects/cv-document-extracted-text.value-object";

type PdfJsLib = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

export interface PdfParsers {
  extract(buffer: Buffer): Promise<CVDocumentExtractedText>;
}

type ParserResult = {
  text: string | null;
};

export class PdfParsersService implements PdfParsers {
  private static pdfjsModule: PdfJsLib | null = null;
  private static canvasPolyfillsReady = false;

  private cleanExtractedText(text: string | null | undefined) {
    const cleaned = text?.trim();
    return cleaned ? cleaned : null;
  }

  private async ensurePdfjsCanvasPolyfills() {
    if (PdfParsersService.canvasPolyfillsReady) return;

    const canvas = await import("@napi-rs/canvas");

    globalThis.DOMMatrix ??= canvas.DOMMatrix as typeof DOMMatrix;
    globalThis.ImageData ??= canvas.ImageData as unknown as typeof ImageData;
    globalThis.Path2D ??= canvas.Path2D as typeof Path2D;
    PdfParsersService.canvasPolyfillsReady = true;
  }

  private async loadPdfjs() {
    if (!PdfParsersService.pdfjsModule) {
      await this.ensurePdfjsCanvasPolyfills();
      await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
      PdfParsersService.pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
    }

    return PdfParsersService.pdfjsModule;
  }

  private getTextItemY(item: unknown): number | null {
    if (
      typeof item === "object" &&
      item !== null &&
      "transform" in item &&
      Array.isArray(item.transform) &&
      typeof item.transform[5] === "number"
    ) {
      return item.transform[5];
    }

    return null;
  }

  async extract(buffer: Buffer): Promise<CVDocumentExtractedText> {
    let textNode: string | null = null;
    let extractErrorNode: string | null = null;
    let textPdfjs: string | null = null;
    let extractErrorPdfjs: string | null = null;

    try {
      const plainTextScannerResult = await this.extractWithPlainTextScanner(buffer);
      textNode = plainTextScannerResult.text;
    } catch (error: unknown) {
      extractErrorNode = getErrorMessage(error);
    }

    try {
      const pdfjsResult = await this.extractWithPdfjs(buffer);
      textPdfjs = pdfjsResult.text;
    } catch (error: unknown) {
      extractErrorPdfjs = getErrorMessage(error);
    }

    return CVDocumentExtractedText.fromPrimitives({
      textPython: null,
      textPdfjs,
      textNode,
      extractErrorPython: null,
      extractErrorPdfjs,
      extractErrorNode,
    });
  }

  private async extractWithPlainTextScanner(
    buffer: Buffer,
  ): Promise<ParserResult> {
    const pdfjsLib = await this.loadPdfjs();

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
    });
    const pdfDocument = await loadingTask.promise;

    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent({
        includeMarkedContent: false,
      });

      let lastY: number | null = null;
      let pageText = "";

      for (const item of textContent.items) {
        const text = "str" in item ? item.str : "";
        if (!text) continue;

        const y = this.getTextItemY(item);
        if (lastY !== null && y !== null && Math.abs(lastY - y) > 1) {
          pageText += "\n";
        } else if (pageText && !pageText.endsWith("\n")) {
          pageText += " ";
        }

        pageText += text;
        lastY = y;
      }

      pageTexts.push(pageText);
    }

    await pdfDocument.destroy();

    return { text: this.cleanExtractedText(pageTexts.join("\n\n")) };
  }

  private async extractWithPdfjs(buffer: Buffer): Promise<ParserResult> {
    const pdfjsLib = await this.loadPdfjs();

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
    });
    const pdfDocument = await loadingTask.promise;

    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      pageTexts.push(pageText);
    }

    await pdfDocument.destroy();

    return { text: this.cleanExtractedText(pageTexts.join("\n")) };
  }
}
