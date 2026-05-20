type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

interface HttpValidationError {
  message: string;
  status: 400;
}

export interface PrepareJobMatchAnalysisCopyPasteRequest {
  jobDescription: string;
  jobUrl: string | null;
}

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

export function parsePrepareJobMatchAnalysisCopyPasteRequest(
  body: unknown,
): Result<PrepareJobMatchAnalysisCopyPasteRequest, HttpValidationError> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return validationError("Request body must be a JSON object");
  }
  const record = body as Record<string, unknown>;
  if (typeof record.jobDescription !== "string" || !record.jobDescription.trim()) {
    return validationError("jobDescription is required");
  }
  return {
    ok: true,
    value: {
      jobDescription: record.jobDescription.trim(),
      jobUrl:
        typeof record.jobUrl === "string" && record.jobUrl.trim()
          ? record.jobUrl.trim()
          : null,
    },
  };
}
