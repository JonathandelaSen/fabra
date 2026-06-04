type PdfJsLib = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfjsModule: PdfJsLib | null = null;
let canvasPolyfillsReady = false;

function cleanExtractedText(text: string | null | undefined) {
  const cleaned = text?.trim();
  return cleaned ? cleaned : null;
}

async function ensurePdfjsCanvasPolyfills() {
  if (canvasPolyfillsReady) return;

  const canvas = await import("@napi-rs/canvas");

  globalThis.DOMMatrix ??= canvas.DOMMatrix as typeof DOMMatrix;
  globalThis.ImageData ??= canvas.ImageData as unknown as typeof ImageData;
  globalThis.Path2D ??= canvas.Path2D as typeof Path2D;
  canvasPolyfillsReady = true;
}

async function loadPdfjs() {
  if (!pdfjsModule) {
    await ensurePdfjsCanvasPolyfills();
    await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
  }

  return pdfjsModule;
}

function getTextItemY(item: unknown): number | null {
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

export async function extractWithPlainTextScanner(
  buffer: Buffer
): Promise<{ text: string | null }> {
  const pdfjsLib = await loadPdfjs();

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

      const y = getTextItemY(item);
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

  return { text: cleanExtractedText(pageTexts.join("\n\n")) };
}

export async function extractWithPdfjs(
  buffer: Buffer
): Promise<{ text: string | null }> {
  const pdfjsLib = await loadPdfjs();

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

  return { text: cleanExtractedText(pageTexts.join("\n")) };
}
