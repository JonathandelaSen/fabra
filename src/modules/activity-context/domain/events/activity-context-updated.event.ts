import type { DomainEvent } from "@/modules/shared";

export class ActivityContextUpdatedEvent implements DomainEvent<{ contextId: string; fields: string[] }> {
  readonly eventName = "activity_context_updated";
  readonly occurredAt = new Date();

  constructor(
    private readonly contextId: string,
    private readonly fields: string[]
  ) {}

  toPrimitives(): { contextId: string; fields: string[] } {
    return { contextId: this.contextId, fields: this.fields };
  }
}
