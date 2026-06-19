import type { AIInteractionRating } from "@/backend/modules/ai-interactions";

type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

interface HttpValidationError {
  message: string;
  status: 400;
}

export interface ReviewAdminAIInteractionRequest {
  rating: AIInteractionRating;
  note: string | null;
}

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseReviewAdminAIInteractionRequest(
  body: unknown,
): Result<ReviewAdminAIInteractionRequest, HttpValidationError> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");

  const rating = body.rating;
  if (rating !== "good" && rating !== "mixed" && rating !== "bad") {
    return validationError("Invalid rating");
  }

  return {
    ok: true,
    value: {
      rating,
      note: typeof body.note === "string" ? body.note.trim() || null : null,
    },
  };
}
