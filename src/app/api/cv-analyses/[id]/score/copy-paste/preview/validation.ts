type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

interface HttpValidationError {
  message: string;
  status: 400;
}

export interface PreviewCVAnalysisCopyPasteRequest {
  rawResponse: string;
  interactionId: string;
  attemptId: string;
}

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

export function parsePreviewCVAnalysisCopyPasteRequest(
  body: unknown,
): Result<PreviewCVAnalysisCopyPasteRequest, HttpValidationError> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return validationError("Request body must be a JSON object");
  }
  const rawResponse = (body as Record<string, unknown>).rawResponse;
  const interactionId = (body as Record<string, unknown>).interactionId;
  const attemptId = (body as Record<string, unknown>).attemptId;
  if (typeof rawResponse !== "string" || !rawResponse.trim()) {
    return validationError("rawResponse is required");
  }
  if (typeof interactionId !== "string" || typeof attemptId !== "string") {
    return validationError("interactionId and attemptId are required");
  }
  return { ok: true, value: { rawResponse, interactionId, attemptId } };
}
