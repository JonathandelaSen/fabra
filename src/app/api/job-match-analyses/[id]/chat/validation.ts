import {
  parseAIRequestConfig,
  type AIRequestConfig,
} from "@/app/api/_shared/ai-request";
import { CHAT_ACTIONS } from "@/app/api/_shared/job-analysis-chat/actions";

type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export interface HttpValidationError {
  message: string;
  status: 400;
}

export type OfferChatPostInput =
  | { action: typeof CHAT_ACTIONS.createConversation; title: string }
  | {
      action: typeof CHAT_ACTIONS.renameConversation;
      conversationId: string;
      title: string;
    }
  | { action: typeof CHAT_ACTIONS.deleteConversation; conversationId: string }
  | ({
      action: typeof CHAT_ACTIONS.message;
      conversationId: string;
      message: string;
    } & AIRequestConfig);

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseListOfferChatRequest(params: URLSearchParams) {
  return {
    ok: true,
    value: { conversationId: params.get("conversationId") },
  } as const;
}

export function parseOfferChatPostRequest(
  body: unknown,
): Result<OfferChatPostInput, HttpValidationError> {
  if (!isRecord(body))
    return validationError("Request body must be a JSON object");
  const action =
    typeof body.action === "string" ? body.action : CHAT_ACTIONS.message;

  if (action === CHAT_ACTIONS.createConversation) {
    return {
      ok: true,
      value: { action, title: text(body.title) ?? "Nueva conversación" },
    };
  }

  if (action === CHAT_ACTIONS.renameConversation) {
    const conversationId = text(body.conversationId);
    const title = text(body.title);
    if (!conversationId || !title)
      return validationError("conversationId and title are required");
    return { ok: true, value: { action, conversationId, title } };
  }

  if (action === CHAT_ACTIONS.deleteConversation) {
    const conversationId = text(body.conversationId);
    if (!conversationId) return validationError("conversationId is required");
    return { ok: true, value: { action, conversationId } };
  }

  const message = text(body.message);
  const ai = parseAIRequestConfig(body);
  const conversationId = text(body.conversationId);
  if (!message) return validationError("Message is required");
  if (!ai.ok) return validationError(ai.message);
  if (!conversationId) return validationError("conversationId is required");
  return {
    ok: true,
    value: {
      action: CHAT_ACTIONS.message,
      conversationId,
      message,
      ...ai.value,
    },
  };
}
