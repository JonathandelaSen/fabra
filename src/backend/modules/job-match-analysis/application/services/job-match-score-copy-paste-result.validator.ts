import { badRequest } from "@/backend/modules/shared";
import type { JobMatchScoringAIResult } from "../../domain/repositories/job-match-scoring-ai.service";
import { ErrorCode } from "@/shared/error-codes";

export {
  JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
  JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
  JOB_MATCH_SCORE_COPY_PASTE_MODEL,
} from "../../domain/value-objects/job-match-copy-paste-constants";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringArray(value: unknown, field: string): string[] {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "string")
  ) {
    throw badRequest(`${field} must be an array of strings.`, ErrorCode.COPY_PASTE_INVALID_RESULT);
  }
  return value;
}

function readOptionalJobKeyData(value: unknown): unknown | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) {
    throw badRequest("jobKeyData must be an object or null.", ErrorCode.COPY_PASTE_INVALID_RESULT);
  }
  return value;
}

export function validateJobMatchScoreCopyPasteResult(
  input: unknown,
): JobMatchScoringAIResult {
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
    aiKeywords: readStringArray(input.aiKeywords, "aiKeywords"),
    improvements: readStringArray(input.improvements, "improvements"),
    jobKeyData: readOptionalJobKeyData(input.jobKeyData),
    jobKeywords: readStringArray(input.jobKeywords, "jobKeywords"),
    cvKeywords: readStringArray(input.cvKeywords, "cvKeywords"),
    matchingKeywords: readStringArray(
      input.matchingKeywords,
      "matchingKeywords",
    ),
    missingKeywords: readStringArray(input.missingKeywords, "missingKeywords"),
  };
}
