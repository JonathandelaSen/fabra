import type { DomainEvent } from "@/modules/shared";

export class ReviewEvidenceItemUpdatedEvent
  implements DomainEvent<{ itemId: string; fields: string[] }>
{
  readonly eventName = "review_evidence_item_updated";
  readonly occurredAt = new Date();

  constructor(
    private readonly itemId: string,
    private readonly fields: string[],
  ) {}

  toPrimitives(): { itemId: string; fields: string[] } {
    return { itemId: this.itemId, fields: this.fields };
  }
}
