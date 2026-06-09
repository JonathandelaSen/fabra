import type { DomainEvent } from "@/modules/shared";

export class ActivityContextRestoredEvent implements DomainEvent<{ contextId: string }> {
  readonly eventName = "activity_context_restored";
  readonly occurredAt = new Date();

  constructor(private readonly contextId: string) {}

  toPrimitives(): { contextId: string } {
    return { contextId: this.contextId };
  }
}
