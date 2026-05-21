type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export interface HttpValidationError {
  message: string;
  status: 400;
}

export interface PrepareInterviewQuestionCopyPasteRequest {
  mode: "generate" | "edit";
  instruction?: string;
}

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parsePrepareInterviewQuestionCopyPasteRequest(
  body: unknown,
): Result<PrepareInterviewQuestionCopyPasteRequest, HttpValidationError> {
  if (!isRecord(body)) {
    return validationError("Request body must be a JSON object");
  }

  const mode = text(body.mode);
  if (mode !== "generate" && mode !== "edit") {
    return validationError("mode must be 'generate' or 'edit'");
  }

  const instruction = text(body.instruction) ?? undefined;
  if (mode === "edit" && !instruction) {
    return validationError("instruction is required for edit mode");
  }

  return { ok: true, value: { mode, instruction } };
}
