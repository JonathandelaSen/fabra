import { Counter, EntityId, UserId } from "@/backend/modules/shared";
import { describe, expect, it, vi } from "vitest";
import { ActivityContext } from "../../domain/entities/activity-context.entity";
import { DeleteActivityContextUseCase } from "./delete-activity-context.use-case";

describe("DeleteActivityContextUseCase", () => {
  it("reassigns records to General before deleting", async () => {
    const context = ActivityContext.fromPrimitives({
      id: "ctx-1",
      userId: "user-1",
      type: "project",
      name: "Acme",
      status: "active",
      isDefault: false,
      createdAt: "2026-05-15T00:00:00.000Z",
      updatedAt: "2026-05-15T00:00:00.000Z",
    });
    const general = ActivityContext.fromPrimitives({
      id: "ctx-general",
      userId: "user-1",
      type: "other",
      name: "General",
      status: "active",
      isDefault: true,
      createdAt: "2026-05-15T00:00:00.000Z",
      updatedAt: "2026-05-15T00:00:00.000Z",
    });
    const repo = {
      findById: vi.fn(async () => context),
      findDefault: vi.fn(async () => general),
      reassignRecordsToDefault: vi.fn(async () => Counter.fromPrimitives(2)),
      delete: vi.fn(async () => undefined),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    await expect(
      new DeleteActivityContextUseCase({
        activityContextRepo: repo as never,
        eventBus: eventBus as never,
      }).execute({
        id: "ctx-1",
        userId: "user-1",
      }),
    ).resolves.toEqual(Counter.fromPrimitives(2));

    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("activity_context_deleted");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      contextId: "ctx-1",
    });
    expect(repo.reassignRecordsToDefault).toHaveBeenCalledWith(
      expect.objectContaining({
        reassignmentUserId: expect.objectContaining({ value: "user-1" }),
        reassignmentSourceContextId: expect.objectContaining({ value: "ctx-1" }),
        reassignmentDefaultContextId: expect.objectContaining({ value: "ctx-general" }),
      })
    );
  });
});
