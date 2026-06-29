import { describe, expect, it } from "vitest";
import {
  LongText,
  OptionalTimestamp,
  Timestamp,
  UserId,
} from "@/backend/modules/shared";
import { FollowUpEntry } from "./follow-up-entry.entity";
import { FollowUpEntryId } from "../value-objects/follow-up-entry-id.value-object";
import { FollowUpId } from "../value-objects/follow-up-id.value-object";
import { FollowUpStatus } from "../value-objects/follow-up-status.value-object";

const now = "2026-06-29T10:00:00.000Z";

function optionalText(value: string | null) {
  return value === null ? null : LongText.fromPrimitives(value);
}

function buildEntry(nextAction: string | null = "Prepare tailored CV") {
  return FollowUpEntry.create({
    id: FollowUpEntryId.fromPrimitives("entry-1"),
    userId: UserId.fromPrimitives("user-1"),
    followUpId: FollowUpId.fromPrimitives("follow-1"),
    status: FollowUpStatus.fromPrimitives("interesting"),
    title: optionalText("Found the offer"),
    notes: optionalText("The role looks promising"),
    nextAction: optionalText(nextAction),
    nextActionAt: OptionalTimestamp.fromPrimitives(
      nextAction === null ? null : "2026-07-01T09:00:00.000Z",
    ),
    updatesCurrentStatus: false,
    occurredAt: Timestamp.fromPrimitives(now),
    createdAt: Timestamp.fromPrimitives(now),
    updatedAt: Timestamp.fromPrimitives(now),
  });
}

describe("FollowUpEntry", () => {
  it("creates an append-only tracking snapshot", () => {
    expect(buildEntry().toPrimitives()).toEqual({
      id: "entry-1",
      userId: "user-1",
      followUpId: "follow-1",
      status: "interesting",
      title: "Found the offer",
      notes: "The role looks promising",
      nextAction: "Prepare tailored CV",
      nextActionAt: "2026-07-01T09:00:00.000Z",
      updatesCurrentStatus: false,
      occurredAt: now,
      createdAt: now,
      updatedAt: now,
    });
    expect(buildEntry().pullDomainEvents().map((event) => event.eventName)).toEqual([
      "follow_up_entry_created",
    ]);
  });

  it("allows a minimal entry with only status and occurrence time", () => {
    const entry = FollowUpEntry.create({
      id: FollowUpEntryId.fromPrimitives("entry-2"),
      userId: UserId.fromPrimitives("user-1"),
      followUpId: FollowUpId.fromPrimitives("follow-1"),
      status: FollowUpStatus.fromPrimitives("interview"),
      title: null,
      notes: null,
      nextAction: null,
      nextActionAt: OptionalTimestamp.fromPrimitives(null),
      updatesCurrentStatus: false,
      occurredAt: Timestamp.fromPrimitives(now),
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    expect(entry.toPrimitives()).toMatchObject({
      status: "interview",
      title: null,
      notes: null,
      nextAction: null,
      nextActionAt: null,
    });
  });

  it("rejects a next-action date without next-action text", () => {
    expect(() =>
      FollowUpEntry.create({
        id: FollowUpEntryId.fromPrimitives("entry-3"),
        userId: UserId.fromPrimitives("user-1"),
        followUpId: FollowUpId.fromPrimitives("follow-1"),
        status: FollowUpStatus.fromPrimitives("interesting"),
        title: null,
        notes: null,
        nextAction: null,
        nextActionAt: OptionalTimestamp.fromPrimitives(
          "2026-07-01T09:00:00.000Z",
        ),
        updatesCurrentStatus: false,
        occurredAt: Timestamp.fromPrimitives(now),
        createdAt: Timestamp.fromPrimitives(now),
        updatedAt: Timestamp.fromPrimitives(now),
      }),
    ).toThrow("Next action is required when its date is provided");
  });

  it("updates the editable historical fields without changing identity", () => {
    const entry = buildEntry();
    entry.pullDomainEvents();

    entry.update({
      status: FollowUpStatus.fromPrimitives("applied"),
      title: optionalText("Application sent"),
      notes: null,
      nextAction: optionalText("Wait for recruiter"),
      nextActionAt: OptionalTimestamp.fromPrimitives(null),
      updatesCurrentStatus: false,
      occurredAt: Timestamp.fromPrimitives("2026-06-30T11:00:00.000Z"),
      updatedAt: Timestamp.fromPrimitives("2026-06-30T11:05:00.000Z"),
    });

    expect(entry.toPrimitives()).toMatchObject({
      id: "entry-1",
      status: "applied",
      title: "Application sent",
      notes: null,
      occurredAt: "2026-06-30T11:00:00.000Z",
    });
    expect(entry.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "follow_up_entry_updated",
    ]);
  });

  it("hydrates without recording events", () => {
    const entry = FollowUpEntry.fromPrimitives(buildEntry().toPrimitives());
    expect(entry.pullDomainEvents()).toEqual([]);
  });
});
