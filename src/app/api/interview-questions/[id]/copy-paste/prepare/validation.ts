import { SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES } from "@/shared/selection-process/constants";

type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export interface HttpValidationError {
  message: string;
  status: 400;
}

type CopyPastePrepareMode =
  (typeof SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES)[keyof typeof SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES];

export interface PrepareInterviewQuestionCopyPasteRequest {
  mode: CopyPastePrepareMode;
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
  if (
    !Object.values(SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES).includes(
      mode as CopyPastePrepareMode
    )
  ) {
    return validationError("mode must be 'generate' or 'edit'");
  }

  const instruction = text(body.instruction) ?? undefined;
  if (mode === SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES.EDIT && !instruction) {
    return validationError("instruction is required for edit mode");
  }

  return { ok: true, value: { mode, instruction } };
}
