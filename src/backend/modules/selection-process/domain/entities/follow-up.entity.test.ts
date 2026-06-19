import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/backend/modules/shared";
import { FollowUp } from "./follow-up.entity";
import { FollowUpId } from "../value-objects/follow-up-id.value-object";
import { FollowUpStatus } from "../value-objects/follow-up-status.value-object";
import { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";

const now = "2026-05-13T10:00:00.000Z";

describe("FollowUp", () => {
  it("updates tracking fields", () => {
    const followUp = FollowUp.create({
      id: FollowUpId.fromPrimitives("follow-1"),
      userId: UserId.fromPrimitives("user-1"),
      jobOpportunityId: JobOpportunityId.fromPrimitives("job-1"),
      status: FollowUpStatus.fromPrimitives("interesting"),
      notes: null,
      nextAction: null,
      nextActionAt: null,
      sourceJobMatchAnalysisId: "analysis-1",
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    followUp.update({
      status: FollowUpStatus.fromPrimitives("applied"),
      notes: "Sent CV",
      nextAction: "Follow up",
      nextActionAt: "2026-05-20T10:00:00.000Z",
      updatedAt: Timestamp.fromPrimitives("2026-05-13T11:00:00.000Z"),
    });

    expect(followUp.toPrimitives()).toMatchObject({
      status: "applied",
      notes: "Sent CV",
      nextAction: "Follow up",
    });
  });

  const buildFollowUp = (status: string = "interesting") =>
    FollowUp.create({
      id: FollowUpId.fromPrimitives("follow-1"),
      userId: UserId.fromPrimitives("user-1"),
      jobOpportunityId: JobOpportunityId.fromPrimitives("job-1"),
      status: FollowUpStatus.fromPrimitives(status as never),
      notes: null,
      nextAction: null,
      nextActionAt: null,
      sourceJobMatchAnalysisId: "analysis-1",
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

  it("records a created event on create", () => {
    const events = buildFollowUp().pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["follow_up_created"]);
    expect(events[0].toPrimitives()).toEqual({ followUpId: "follow-1" });
  });

  it("records updated and status-changed events when status changes", () => {
    const followUp = buildFollowUp("interesting");
    followUp.pullDomainEvents();

    followUp.update({
      status: FollowUpStatus.fromPrimitives("applied"),
      notes: null,
      nextAction: null,
      nextActionAt: null,
      updatedAt: Timestamp.fromPrimitives("2026-05-13T11:00:00.000Z"),
    });
    const events = followUp.pullDomainEvents();

    expect(events.map((e) => e.eventName)).toEqual([
      "follow_up_updated",
      "follow_up_status_changed",
    ]);
    expect(events[1].toPrimitives()).toEqual({
      followUpId: "follow-1",
      previousStatus: "interesting",
      newStatus: "applied",
    });
  });

  it("records only an updated event when status is unchanged", () => {
    const followUp = buildFollowUp("applied");
    followUp.pullDomainEvents();

    followUp.update({
      status: FollowUpStatus.fromPrimitives("applied"),
      notes: "Sent CV",
      nextAction: null,
      nextActionAt: null,
      updatedAt: Timestamp.fromPrimitives("2026-05-13T11:00:00.000Z"),
    });

    expect(followUp.pullDomainEvents().map((e) => e.eventName)).toEqual(["follow_up_updated"]);
  });

  it("does not record events when hydrated from primitives", () => {
    const hydrated = FollowUp.fromPrimitives(buildFollowUp().toPrimitives());
    expect(hydrated.pullDomainEvents()).toEqual([]);
  });
});
