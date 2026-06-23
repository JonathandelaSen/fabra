type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

interface HttpValidationError {
  message: string;
  status: 400;
}

export interface SaveAdminAIInteractionEvalCaseRequest {
  name: string;
  note: string | null;
}

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSaveAdminAIInteractionEvalCaseRequest(
  body: unknown,
): Result<SaveAdminAIInteractionEvalCaseRequest, HttpValidationError> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length === 0) return validationError("Case name is required");
  if (name.length > 120) return validationError("Case name must be 120 characters or fewer");

  const note = typeof body.note === "string" ? body.note.trim() || null : null;
  if (note && note.length > 1000) return validationError("Note must be 1000 characters or fewer");

  return { ok: true, value: { name, note } };
}
