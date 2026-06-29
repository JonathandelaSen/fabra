import type { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import type { FollowUp } from "../../domain/entities/follow-up.entity";
import type { FollowUpStatusPrimitives } from "../../domain/value-objects/follow-up-status.value-object";

export interface FollowUpEntryResponse {
  id: string;
  status: FollowUpStatusPrimitives;
  title: string | null;
  notes: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpTrackingResponse {
  currentStatus: FollowUpStatusPrimitives;
  entries: FollowUpEntryResponse[];
}

export function presentFollowUpEntry(
  entry: FollowUpEntry,
): FollowUpEntryResponse {
  const primitives = entry.toPrimitives();
  return {
    id: primitives.id,
    status: primitives.status,
    title: primitives.title,
    notes: primitives.notes,
    nextAction: primitives.nextAction,
    nextActionAt: primitives.nextActionAt,
    occurredAt: primitives.occurredAt,
    createdAt: primitives.createdAt,
    updatedAt: primitives.updatedAt,
  };
}

export function presentFollowUpTracking(input: {
  followUp: FollowUp;
  entries: FollowUpEntry[];
}): FollowUpTrackingResponse {
  return {
    currentStatus: input.followUp.toPrimitives().status,
    entries: input.entries.map(presentFollowUpEntry),
  };
}
