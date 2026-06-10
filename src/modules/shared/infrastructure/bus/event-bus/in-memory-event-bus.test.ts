import { describe, expect, it } from "vitest";
import { InMemoryEventBus } from "./in-memory-event-bus";
import type { DomainEvent } from "../../../domain/bus/event-bus/domain-event";

class DummyEvent implements DomainEvent {
  readonly eventName = "dummy.event";
  readonly occurrences = new Date();
  toPrimitives(): Record<string, unknown> {
    return { data: "test" };
  }
}

describe("InMemoryEventBus", () => {
  it("tracks published events", async () => {
    const bus = new InMemoryEventBus();
    const event = new DummyEvent();

    await bus.publish([event]);

    expect(bus.getEvents()).toEqual([event]);

    bus.clear();
    expect(bus.getEvents()).toEqual([]);
  });
});
