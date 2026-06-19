import type { DomainEvent } from "@/backend/modules/shared";

export class FollowUpStatusChangedEvent
  implements DomainEvent<{ followUpId: string; previousStatus: string; newStatus: string }>
{
  readonly eventName = "follow_up_status_changed";
  readonly occurredAt = new Date();

  constructor(
    private readonly followUpId: string,
    private readonly previousStatus: string,
    private readonly newStatus: string
  ) {}

  toPrimitives(): { followUpId: string; previousStatus: string; newStatus: string } {
    return {
      followUpId: this.followUpId,
      previousStatus: this.previousStatus,
      newStatus: this.newStatus,
    };
  }
}
