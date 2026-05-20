type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

interface HttpValidationError {
  message: string;
  status: 400;
}

export interface ApplyCVAnalysisCopyPasteRequest {
  parsedResult: {
    score: number;
    feedback: string;
    keywords: string[];
    improvements: string[];
  };
}

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

export function parseApplyCVAnalysisCopyPasteRequest(
  body: unknown,
): Result<ApplyCVAnalysisCopyPasteRequest, HttpValidationError> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return validationError("Request body must be a JSON object");
  }
  const parsedResult = (body as Record<string, unknown>).parsedResult;
  if (typeof parsedResult !== "object" || parsedResult === null || Array.isArray(parsedResult)) {
    return validationError("parsedResult is required");
  }
  return {
    ok: true,
    value: {
      parsedResult: parsedResult as ApplyCVAnalysisCopyPasteRequest["parsedResult"],
    },
  };
}
