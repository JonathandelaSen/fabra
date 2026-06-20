import { describe, expect, it } from "vitest";
import { EntityId, UserId } from "@/backend/modules/shared";
import { ActivityContextRecordReassignment } from "./activity-context-record-reassignment.value-object";

describe("ActivityContextRecordReassignment", () => {
  it("hydrates ids and round-trips primitives", () => {
    const reassignment = ActivityContextRecordReassignment.fromPrimitives({
      userId: "user-1",
      sourceContextId: "ctx-source",
      defaultContextId: "ctx-default",
    });

    expect(reassignment.userId).toBeInstanceOf(UserId);
    expect(reassignment.sourceContextId).toBeInstanceOf(EntityId);
    expect(reassignment.defaultContextId).toBeInstanceOf(EntityId);
    expect(reassignment.toPrimitives()).toEqual({
      userId: "user-1",
      sourceContextId: "ctx-source",
      defaultContextId: "ctx-default",
    });
  });
});
