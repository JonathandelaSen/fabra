import type { DomainEvent } from "@/backend/modules/shared";

export class FollowUpEntryUpdatedEvent
  implements DomainEvent<{ followUpEntryId: string; followUpId: string }>
{
  readonly eventName = "follow_up_entry_updated";
  readonly occurredAt = new Date();

  constructor(
    private readonly followUpEntryId: string,
    private readonly followUpId: string,
  ) {}

  toPrimitives(): { followUpEntryId: string; followUpId: string } {
    return {
      followUpEntryId: this.followUpEntryId,
      followUpId: this.followUpId,
    };
  }
}
