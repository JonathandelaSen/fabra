import type { DomainEvent } from "@/modules/shared";

export class ActivityContextDeletedEvent implements DomainEvent<{ contextId: string }> {
  readonly eventName = "activity_context_deleted";
  readonly occurredAt = new Date();

  constructor(private readonly contextId: string) {}

  toPrimitives(): { contextId: string } {
    return { contextId: this.contextId };
  }
}
