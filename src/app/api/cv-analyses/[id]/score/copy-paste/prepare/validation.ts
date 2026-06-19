import { isInterfaceLanguage, type InterfaceLanguage } from "@/frontend/i18n/config";

type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

interface HttpValidationError {
  message: string;
  status: 400;
}

export interface PrepareCVAnalysisCopyPasteRequest {
  additionalContext: string | null;
  language: InterfaceLanguage | null;
}

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

export function parsePrepareCVAnalysisCopyPasteRequest(
  body: unknown,
): Result<PrepareCVAnalysisCopyPasteRequest, HttpValidationError> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return validationError("Request body must be a JSON object");
  }
  const record = body as Record<string, unknown>;
  return {
    ok: true,
    value: {
      additionalContext:
        typeof record.additionalContext === "string"
          ? record.additionalContext.trim() || null
          : null,
      language: isInterfaceLanguage(record.language) ? record.language : null,
    },
  };
}
