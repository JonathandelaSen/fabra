import { badRequest } from "@/modules/shared";
import type { CopyPasteEnvelopeExpected } from "./copy-paste-workflow.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCopyPasteEnvelope(
  input: unknown,
  expected: CopyPasteEnvelopeExpected,
): Record<string, unknown> {
  if (!isRecord(input)) {
    throw badRequest("The pasted response must be a JSON object.");
  }
  if (input.workflowId !== expected.workflowId) {
    throw badRequest(`The pasted response belongs to a different workflow. Expected ${expected.workflowId}, got ${input.workflowId}`);
  }
  if (input.schemaVersion !== expected.schemaVersion) {
    throw badRequest("The pasted response uses an unsupported schema version.");
  }
  if (!isRecord(input.result)) {
    throw badRequest("The pasted response must include a result object.");
  }
  return input.result;
}
