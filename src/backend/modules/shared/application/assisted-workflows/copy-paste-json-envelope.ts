import { badRequest } from "@/backend/modules/shared";
import type { CopyPasteEnvelopeExpected } from "./copy-paste-workflow.types";
import { ErrorCode } from "@/shared/error-codes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCopyPasteEnvelope(
  input: unknown,
  expected: CopyPasteEnvelopeExpected,
): Record<string, unknown> {
  if (!isRecord(input)) {
    throw badRequest("The pasted response must be a JSON object.", ErrorCode.COPY_PASTE_INVALID_JSON);
  }
  if (input.workflowId !== expected.workflowId) {
    throw badRequest(`The pasted response belongs to a different workflow. Expected ${expected.workflowId}, got ${input.workflowId}`, ErrorCode.COPY_PASTE_INVALID_JSON);
  }
  if (input.schemaVersion !== expected.schemaVersion) {
    throw badRequest("The pasted response uses an unsupported schema version.", ErrorCode.COPY_PASTE_INVALID_JSON);
  }
  if (!isRecord(input.result)) {
    throw badRequest("The pasted response must include a result object.", ErrorCode.COPY_PASTE_INVALID_JSON);
  }
  return input.result;
}
