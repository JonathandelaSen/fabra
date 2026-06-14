import { parseAIRequestConfig } from "@/app/api/_shared/ai-request";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseListCVChatMessagesRequest(params: URLSearchParams) {
  const conversationId = text(params.get("conversationId"));
  return conversationId
    ? { ok: true, value: { conversationId } } as const
    : { ok: false, error: { message: "conversationId is required", status: 400 as const } } as const;
}

export function parseSendCVChatMessageRequest(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: { message: "Request body must be a JSON object", status: 400 as const } } as const;
  }
  const input = body as Record<string, unknown>;
  const conversationId = text(input.conversationId);
  const message = text(input.message);
  const ai = parseAIRequestConfig(input);
  if (!conversationId) return { ok: false, error: { message: "conversationId is required", status: 400 as const } } as const;
  if (!message) return { ok: false, error: { message: "Message is required", status: 400 as const } } as const;
  if (!ai.ok) return { ok: false, error: { message: ai.message, status: 400 as const } } as const;
  return { ok: true, value: { conversationId, message, ...ai.value } } as const;
}
