type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

interface HttpValidationError {
  message: string;
  status: 400;
}

export interface SubmitPublicCVFeedbackRequest {
  feedbackText: string;
  giverName: string | null;
  giverContext: string | null;
  website: unknown;
}

export function parseSubmitPublicCVFeedbackRequest(
  body: unknown,
): Result<SubmitPublicCVFeedbackRequest, HttpValidationError> {
  const record =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const feedbackText =
    typeof record.feedbackText === "string" ? record.feedbackText.trim() : "";
  if (!record.website && (feedbackText.length < 2 || feedbackText.length > 5000)) {
    return { ok: false, error: { message: "Invalid feedback", status: 400 } };
  }

  return {
    ok: true,
    value: {
      feedbackText,
      giverName: typeof record.giverName === "string" ? record.giverName : null,
      giverContext:
        typeof record.giverContext === "string" ? record.giverContext : null,
      website: record.website,
    },
  };
}
