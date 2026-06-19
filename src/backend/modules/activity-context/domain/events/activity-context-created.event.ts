import type { DomainEvent } from "@/modules/shared";

export class ActivityContextCreatedEvent implements DomainEvent<{ contextId: string }> {
  readonly eventName = "activity_context_created";
  readonly occurredAt = new Date();

  constructor(private readonly contextId: string) {}

  toPrimitives(): { contextId: string } {
    return { contextId: this.contextId };
  }
}
