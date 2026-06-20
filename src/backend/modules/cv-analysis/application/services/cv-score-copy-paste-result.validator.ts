import { badRequest } from "@/backend/modules/shared";
import type { CVScoringAIResultPrimitives } from "../../domain/repositories/cv-scoring-ai.service";
import { ErrorCode } from "@/shared/error-codes";

export const CV_SCORE_COPY_PASTE_WORKFLOW_ID = "cv_analysis.score" as const;
export const CV_SCORE_COPY_PASTE_SCHEMA_VERSION = "1" as const;
export const CV_SCORE_COPY_PASTE_MODEL = "external-chat" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw badRequest(`${field} must be an array of strings.`, ErrorCode.COPY_PASTE_INVALID_RESULT);
  }
  return value;
}

export function validateCVScoreCopyPasteResult(
  input: unknown,
): CVScoringAIResultPrimitives {
  if (!isRecord(input)) {
    throw badRequest("The analysis result must be a JSON object.", ErrorCode.COPY_PASTE_INVALID_RESULT);
  }
  if (typeof input.score !== "number" || input.score < 0 || input.score > 100) {
    throw badRequest("score must be a number from 0 to 100.", ErrorCode.COPY_PASTE_INVALID_RESULT);
  }
  if (typeof input.feedback !== "string" || !input.feedback.trim()) {
    throw badRequest("feedback is required.", ErrorCode.COPY_PASTE_INVALID_RESULT);
  }

  return {
    score: input.score,
    feedback: input.feedback.trim(),
    keywords: readStringArray(input.keywords, "keywords"),
    improvements: readStringArray(input.improvements, "improvements"),
  };
}
