import type { DomainEvent } from "../../../domain/bus/event-bus/domain-event";
import type { EventBus } from "../../../domain/bus/event-bus/event-bus";
import type { Telemetry } from "../../../application/telemetry/telemetry";

export class InMemoryEventBus implements EventBus {
  private publishedEvents: DomainEvent[] = [];

  constructor(private readonly telemetry: Telemetry) {}

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      let published = false;
      const publishOnce = async () => {
        if (published) return;
        published = true;
        this.publishedEvents.push(event);

        try {
          this.telemetry.log({
            level: "info",
            message: "Domain event published",
            attributes: {
              "fabra.layer": "domain",
              "fabra.domain_event": event.eventName,
              "fabra.occurred_at": event.occurredAt.toISOString(),
            },
          });
        } catch {
          // Telemetry is best effort and must never alter event publication.
        }
      };

      try {
        await this.telemetry.trace(
          {
            name: `event_bus.publish ${event.eventName}`,
            operation: "event_bus.publish",
            attributes: {
              "fabra.layer": "domain",
              "fabra.domain_event": event.eventName,
            },
          },
          publishOnce,
        );
      } catch {
        await publishOnce();
      }
    }
  }

  getEvents(): DomainEvent[] {
    return this.publishedEvents;
  }

  clear(): void {
    this.publishedEvents = [];
  }
}
