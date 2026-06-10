import type { DomainEvent } from "../../domain/bus/event-bus/domain-event";
import type { EventBus } from "../../domain/bus/event-bus/event-bus";

export class InMemoryEventBus implements EventBus {
  private publishedEvents: DomainEvent[] = [];

  async publish(events: DomainEvent[]): Promise<void> {
    this.publishedEvents.push(...events);
    for (const event of events) {
      console.log(`[EventBus] Published event: ${event.eventName}`, event.toPrimitives());
    }
  }

  getEvents(): DomainEvent[] {
    return this.publishedEvents;
  }

  clear(): void {
    this.publishedEvents = [];
  }
}
