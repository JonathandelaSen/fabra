import type { DomainEvent } from "@/backend/modules/shared";

export class ActivityContextArchivedEvent implements DomainEvent<{ contextId: string }> {
  readonly eventName = "activity_context_archived";
  readonly occurredAt = new Date();

  constructor(private readonly contextId: string) {}

  toPrimitives(): { contextId: string } {
    return { contextId: this.contextId };
  }
}
