import type { DomainEvent } from "@/modules/shared";

export class FollowUpUpdatedEvent implements DomainEvent<{ followUpId: string }> {
  readonly eventName = "follow_up_updated";
  readonly occurredAt = new Date();

  constructor(private readonly followUpId: string) {}

  toPrimitives(): { followUpId: string } {
    return { followUpId: this.followUpId };
  }
}
