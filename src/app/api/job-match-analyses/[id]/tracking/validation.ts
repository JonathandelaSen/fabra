import {
  OFFER_STATUSES,
  type OfferStatus,
} from "@/lib/analysis-types";

type Result<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; error: { message: string; status: 400 } };

export interface FollowUpEntryHttpInput {
  status: OfferStatus;
  title: string | null;
  notes: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  occurredAt: string;
}

export interface CreateFollowUpEntryHttpInput extends FollowUpEntryHttpInput {
  updateCurrentStatus: boolean;
}

function validationError(message: string): Result<never> {
  return { ok: false, error: { message, status: 400 } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return undefined;
  return value.trim() || null;
}

function requiredDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function optionalDate(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function parseFields(body: Record<string, unknown>): Result<FollowUpEntryHttpInput> {
  if (
    typeof body.status !== "string" ||
    !OFFER_STATUSES.includes(body.status as OfferStatus)
  ) {
    return validationError("Invalid tracking status");
  }
  const occurredAt = requiredDate(body.occurredAt);
  if (!occurredAt) return validationError("Invalid occurrence date");
  const title = optionalText(body.title);
  const notes = optionalText(body.notes);
  const nextAction = optionalText(body.nextAction);
  const nextActionAt = optionalDate(body.nextActionAt);
  if (title === undefined) return validationError("Invalid tracking title");
  if (notes === undefined) return validationError("Invalid tracking notes");
  if (nextAction === undefined) return validationError("Invalid next action");
  if (nextActionAt === undefined) {
    return validationError("Invalid next action date");
  }
  if (nextActionAt !== null && nextAction === null) {
    return validationError("Next action is required when its date is provided");
  }

  return {
    ok: true,
    value: {
      status: body.status as OfferStatus,
      title,
      notes,
      nextAction,
      nextActionAt,
      occurredAt,
    },
  };
}

export function parseCreateFollowUpEntryRequest(
  body: unknown,
): Result<CreateFollowUpEntryHttpInput> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");
  if (typeof body.updateCurrentStatus !== "boolean") {
    return validationError("updateCurrentStatus must be a boolean");
  }
  const parsed = parseFields(body);
  if (!parsed.ok) return parsed;
  return {
    ok: true,
    value: {
      ...parsed.value,
      updateCurrentStatus: body.updateCurrentStatus,
    },
  };
}

export function parseUpdateFollowUpEntryRequest(
  body: unknown,
): Result<FollowUpEntryHttpInput> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");
  if (body.updateCurrentStatus !== undefined) {
    return validationError("Editing history cannot change the current status");
  }
  return parseFields(body);
}
