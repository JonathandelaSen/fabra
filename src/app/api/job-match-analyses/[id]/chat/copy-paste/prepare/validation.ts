type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export interface HttpValidationError {
  message: string;
  status: 400;
}

export interface PrepareOfferChatCopyPasteRequest {
  conversationId: string;
  message: string;
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

export function parsePrepareOfferChatCopyPasteRequest(
  body: unknown,
): Result<PrepareOfferChatCopyPasteRequest, HttpValidationError> {
  if (!isRecord(body)) {
    return validationError("Request body must be a JSON object");
  }

  const conversationId = text(body.conversationId);
  const message = text(body.message);
  if (!conversationId) return validationError("conversationId is required");
  if (!message) return validationError("Message is required");

  return { ok: true, value: { conversationId, message } };
}
