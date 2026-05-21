type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export interface HttpValidationError {
  message: string;
  status: 400;
}

export interface ApplyOfferChatCopyPasteRequest {
  conversationId: string;
  userMessage: string;
  assistantResponse: string;
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

export function parseApplyOfferChatCopyPasteRequest(
  body: unknown,
): Result<ApplyOfferChatCopyPasteRequest, HttpValidationError> {
  if (!isRecord(body)) {
    return validationError("Request body must be a JSON object");
  }

  const conversationId = text(body.conversationId);
  const userMessage = text(body.userMessage);
  const assistantResponse = text(body.assistantResponse);
  if (!conversationId) return validationError("conversationId is required");
  if (!userMessage) return validationError("Message is required");
  if (!assistantResponse) {
    return validationError("Assistant response is required");
  }

  return {
    ok: true,
    value: { conversationId, userMessage, assistantResponse },
  };
}
