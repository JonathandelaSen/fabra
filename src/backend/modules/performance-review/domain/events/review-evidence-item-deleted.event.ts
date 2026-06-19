import type { DomainEvent } from "@/backend/modules/shared";

export class ReviewEvidenceItemDeletedEvent
  implements DomainEvent<{ itemId: string }>
{
  readonly eventName = "review_evidence_item_deleted";
  readonly occurredAt = new Date();

  constructor(private readonly itemId: string) {}

  toPrimitives(): { itemId: string } {
    return { itemId: this.itemId };
  }
}
