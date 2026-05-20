type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

interface HttpValidationError {
  message: string;
  status: 400;
}

export interface ApplyJobMatchAnalysisCopyPasteRequest {
  parsedResult: Record<string, unknown>;
  jobDescription: string;
  jobUrl: string | null;
}

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

export function parseApplyJobMatchAnalysisCopyPasteRequest(
  body: unknown,
): Result<ApplyJobMatchAnalysisCopyPasteRequest, HttpValidationError> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return validationError("Request body must be a JSON object");
  }
  const record = body as Record<string, unknown>;
  const parsedResult = record.parsedResult;
  if (
    typeof parsedResult !== "object" ||
    parsedResult === null ||
    Array.isArray(parsedResult)
  ) {
    return validationError("parsedResult is required");
  }
  if (typeof record.jobDescription !== "string" || !record.jobDescription.trim()) {
    return validationError("jobDescription is required");
  }
  return {
    ok: true,
    value: {
      parsedResult: parsedResult as Record<string, unknown>,
      jobDescription: record.jobDescription.trim(),
      jobUrl:
        typeof record.jobUrl === "string" && record.jobUrl.trim()
          ? record.jobUrl.trim()
          : null,
    },
  };
}
