import { describe, expect, it } from "vitest";
import { FollowUpTrackingReadModel } from "./follow-up-tracking-read-model.value-object";

describe("FollowUpTrackingReadModel", () => {
  it("hydrates and serializes a follow-up with its entries", () => {
    const primitives = {
      followUp: {
        id: "follow-1",
        userId: "user-1",
        jobOpportunityId: "job-1",
        status: "interview" as const,
        notes: null,
        nextAction: null,
        nextActionAt: null,
        sourceJobMatchAnalysisId: "analysis-1",
        createdAt: "2026-06-01T09:00:00.000Z",
        updatedAt: "2026-06-29T09:00:00.000Z",
      },
      entries: [
        {
          id: "entry-1",
          userId: "user-1",
          followUpId: "follow-1",
          status: "interview" as const,
          title: null,
          notes: "Interview notes",
          nextAction: null,
          nextActionAt: null,
          updatesCurrentStatus: false,
          occurredAt: "2026-06-20T09:00:00.000Z",
          createdAt: "2026-06-20T09:00:00.000Z",
          updatedAt: "2026-06-20T09:00:00.000Z",
        },
      ],
    };

    const readModel = FollowUpTrackingReadModel.fromPrimitives(primitives);

    expect(readModel.followUp.id).toBe("follow-1");
    expect(readModel.entries[0].id).toBe("entry-1");
    expect(readModel.toPrimitives()).toEqual(primitives);
  });
});
