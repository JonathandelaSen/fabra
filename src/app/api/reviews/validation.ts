import {
  EVIDENCE_SOURCES,
  REVIEW_TYPES,
  type EvidenceSourceValue,
  type ReviewTypeValue,
} from "@/modules/performance-review";

type Result<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; error: { message: string; status: 400 } };

function validationError(message: string): Result<never> {
  return { ok: false, error: { message, status: 400 } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function requiredText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export interface CreatePerformanceReviewHttpInput {
  title: string;
  reviewType: ReviewTypeValue;
  reviewDate: string;
  periodStart: string;
  periodEnd: string;
  activityContextId: string | null;
}

export function parseCreatePerformanceReviewRequest(
  body: unknown,
): Result<CreatePerformanceReviewHttpInput> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");

  const title = requiredText(body.title);
  if (!title) return validationError("Title is required");
  if (!REVIEW_TYPES.includes(body.reviewType as ReviewTypeValue)) {
    return validationError("Review type is invalid");
  }
  if (!isCalendarDate(body.reviewDate)) {
    return validationError("Review date must use YYYY-MM-DD format");
  }
  if (!isCalendarDate(body.periodStart) || !isCalendarDate(body.periodEnd)) {
    return validationError("Period dates must use YYYY-MM-DD format");
  }
  if (body.periodStart > body.periodEnd) {
    return validationError("Period start must be on or before period end");
  }

  return {
    ok: true,
    value: {
      title,
      reviewType: body.reviewType as ReviewTypeValue,
      reviewDate: body.reviewDate,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      activityContextId:
        body.activityContextId == null
          ? null
          : requiredText(body.activityContextId),
    },
  };
}

export interface UpdatePerformanceReviewHttpInput {
  title?: string;
  reviewType?: ReviewTypeValue;
  reviewDate?: string;
  periodStart?: string;
  periodEnd?: string;
  activityContextId?: string | null;
  complete?: boolean;
}

export function parseUpdatePerformanceReviewRequest(
  body: unknown,
): Result<UpdatePerformanceReviewHttpInput> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");

  const updates: UpdatePerformanceReviewHttpInput = {};

  if (body.title !== undefined) {
    const title = requiredText(body.title);
    if (!title) return validationError("Title is required");
    updates.title = title;
  }
  if (body.reviewType !== undefined) {
    if (!REVIEW_TYPES.includes(body.reviewType as ReviewTypeValue)) {
      return validationError("Review type is invalid");
    }
    updates.reviewType = body.reviewType as ReviewTypeValue;
  }
  if (body.reviewDate !== undefined) {
    if (!isCalendarDate(body.reviewDate)) {
      return validationError("Review date must use YYYY-MM-DD format");
    }
    updates.reviewDate = body.reviewDate;
  }
  if (body.periodStart !== undefined) {
    if (!isCalendarDate(body.periodStart)) {
      return validationError("Period start must use YYYY-MM-DD format");
    }
    updates.periodStart = body.periodStart;
  }
  if (body.periodEnd !== undefined) {
    if (!isCalendarDate(body.periodEnd)) {
      return validationError("Period end must use YYYY-MM-DD format");
    }
    updates.periodEnd = body.periodEnd;
  }
  if (body.activityContextId !== undefined) {
    updates.activityContextId =
      body.activityContextId == null
        ? null
        : requiredText(body.activityContextId);
  }
  if (body.complete !== undefined) {
    if (typeof body.complete !== "boolean") {
      return validationError("complete must be a boolean");
    }
    updates.complete = body.complete;
  }

  return { ok: true, value: updates };
}

export interface AddEvidenceItemHttpInput {
  source: EvidenceSourceValue;
  sourceId: string | null;
  content: string;
  highlighted: boolean;
}

export function parseAddEvidenceItemRequest(
  body: unknown,
): Result<AddEvidenceItemHttpInput> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");

  if (!EVIDENCE_SOURCES.includes(body.source as EvidenceSourceValue)) {
    return validationError("Evidence source is invalid");
  }
  const content = requiredText(body.content);
  if (!content) return validationError("Evidence content is required");
  const sourceId = body.sourceId == null ? null : requiredText(body.sourceId);

  return {
    ok: true,
    value: {
      source: body.source as EvidenceSourceValue,
      sourceId,
      content,
      highlighted: body.highlighted === true,
    },
  };
}

export interface UpdateEvidenceItemHttpInput {
  content?: string;
  highlighted?: boolean;
}

export function parseUpdateEvidenceItemRequest(
  body: unknown,
): Result<UpdateEvidenceItemHttpInput> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");

  const updates: UpdateEvidenceItemHttpInput = {};
  if (body.content !== undefined) {
    const content = requiredText(body.content);
    if (!content) return validationError("Evidence content is required");
    updates.content = content;
  }
  if (body.highlighted !== undefined) {
    if (typeof body.highlighted !== "boolean") {
      return validationError("highlighted must be a boolean");
    }
    updates.highlighted = body.highlighted;
  }
  return { ok: true, value: updates };
}

export function parseReorderEvidenceRequest(
  body: unknown,
): Result<{ orderedItemIds: string[] }> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");
  if (
    !Array.isArray(body.orderedItemIds) ||
    !body.orderedItemIds.every((id) => typeof id === "string" && id.trim())
  ) {
    return validationError("orderedItemIds must be an array of ids");
  }
  return { ok: true, value: { orderedItemIds: body.orderedItemIds as string[] } };
}

export interface EditSelfAssessmentHttpInput {
  content: string;
}

export function parseEditSelfAssessmentRequest(
  body: unknown,
): Result<EditSelfAssessmentHttpInput> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");
  const content = requiredText(body.content);
  if (!content) return validationError("Content is required");
  return { ok: true, value: { content } };
}

export interface GenerateSelfAssessmentHttpInput {
  provider: string;
  apiKey?: string;
  model: string;
}

export function parseGenerateSelfAssessmentRequest(
  body: unknown,
): Result<GenerateSelfAssessmentHttpInput> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");
  const provider = requiredText(body.provider);
  if (!provider) return validationError("provider is required");
  const model = requiredText(body.model);
  if (!model) return validationError("model is required");
  const apiKey =
    body.apiKey == null ? undefined : requiredText(body.apiKey) ?? undefined;
  return { ok: true, value: { provider, apiKey, model } };
}
