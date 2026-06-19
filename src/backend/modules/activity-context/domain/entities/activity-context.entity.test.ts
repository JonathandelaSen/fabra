import { EntityId, UserId } from "@/backend/modules/shared";
import { describe, expect, it } from "vitest";
import { ActivityContext } from "./activity-context.entity";

describe("ActivityContext", () => {
  it("creates and serializes an activity context", () => {
    const context = ActivityContext.create({
      id: EntityId.fromPrimitives("ctx-1"),
      userId: UserId.fromPrimitives("user-1"),
      type: "project",
      name: "Acme - TL",
      createdAt: "2026-05-15T00:00:00.000Z",
      updatedAt: "2026-05-15T00:00:00.000Z",
    });

    expect(context.toPrimitives()).toMatchObject({
      id: "ctx-1",
      userId: "user-1",
      type: "project",
      name: "Acme - TL",
      status: "active",
      isDefault: false,
    });
  });

  const buildContext = () =>
    ActivityContext.create({
      id: EntityId.fromPrimitives("ctx-1"),
      userId: UserId.fromPrimitives("user-1"),
      type: "project",
      name: "Acme - TL",
      createdAt: "2026-05-15T00:00:00.000Z",
      updatedAt: "2026-05-15T00:00:00.000Z",
    });

  it("records a created event on create", () => {
    const events = buildContext().pullDomainEvents();
    expect(events.map((e) => e.eventName)).toEqual(["activity_context_created"]);
    expect(events[0].toPrimitives()).toEqual({ contextId: "ctx-1" });
  });

  it("records an updated event with changed fields", () => {
    const context = buildContext();
    context.pullDomainEvents();

    context.update({ name: "Acme - Staff", updatedAt: "2026-05-16T00:00:00.000Z" });
    const events = context.pullDomainEvents();

    expect(events.map((e) => e.eventName)).toEqual(["activity_context_updated"]);
    expect(events[0].toPrimitives()).toEqual({ contextId: "ctx-1", fields: ["name"] });
  });

  it("does not record an updated event when nothing changes", () => {
    const context = buildContext();
    context.pullDomainEvents();

    context.update({ updatedAt: "2026-05-16T00:00:00.000Z" });

    expect(context.pullDomainEvents()).toEqual([]);
  });

  it("records archived and restored events on status transitions", () => {
    const context = buildContext();
    context.pullDomainEvents();

    context.update({ status: "archived", updatedAt: "2026-05-16T00:00:00.000Z" });
    expect(context.pullDomainEvents().map((e) => e.eventName)).toEqual([
      "activity_context_updated",
      "activity_context_archived",
    ]);

    context.update({ status: "active", updatedAt: "2026-05-17T00:00:00.000Z" });
    expect(context.pullDomainEvents().map((e) => e.eventName)).toEqual([
      "activity_context_updated",
      "activity_context_restored",
    ]);
  });

  it("records a deleted event on delete", () => {
    const context = buildContext();
    context.pullDomainEvents();

    context.delete();
    const events = context.pullDomainEvents();

    expect(events.map((e) => e.eventName)).toEqual(["activity_context_deleted"]);
    expect(events[0].toPrimitives()).toEqual({ contextId: "ctx-1" });
  });
});
