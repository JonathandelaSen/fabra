import { getErrorMessage } from "@/lib/errors";
import { extractWithPdfjs, extractWithPlainTextScanner } from "@/lib/pdf-parsers";

export interface ExtractedPdfText {
  text_python: string | null;
  text_pdfjs: string | null;
  text_node: string | null;
  extract_error_python: string | null;
  extract_error_pdfjs: string | null;
  extract_error_node: string | null;
}

export interface PdfExtractionContext {
  userId: string;
  cvId: string;
  requestId: string;
  fileSize?: number | null;
  filename?: string | null;
  pdfStoragePath?: string | null;
}

type ParserResponse = {
  text?: string | null;
  error?: string | null;
};

async function extractWithPythonService(
  context: PdfExtractionContext | undefined
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

export async function extractPdfText(
  buffer: Buffer,
  context?: PdfExtractionContext
): Promise<ExtractedPdfText> {
  let text_node: string | null = null;
  let extract_error_node: string | null = null;
  let text_pdfjs: string | null = null;
  let extract_error_pdfjs: string | null = null;
  let text_python: string | null = null;
  let extract_error_python: string | null = null;

  try {
    const parsedOut = await extractWithPlainTextScanner(buffer);
    text_node = parsedOut.text || null;
  } catch (e: unknown) {
    extract_error_node = getErrorMessage(e);
  }

  try {
    const parsedOut = await extractWithPdfjs(buffer);
    text_pdfjs = parsedOut.text || null;
  } catch (e: unknown) {
    extract_error_pdfjs = getErrorMessage(e);
  }

  try {
    const parsedOut = await extractWithPythonService(context);
    text_python = parsedOut.text || null;
    extract_error_python = parsedOut.error || null;
  } catch (e: unknown) {
    extract_error_python = getErrorMessage(e);
  }

  return {
    text_python,
    text_pdfjs,
    text_node,
    extract_error_python,
    extract_error_pdfjs,
    extract_error_node,
  };
}
