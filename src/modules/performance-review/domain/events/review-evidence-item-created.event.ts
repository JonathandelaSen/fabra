import type { DomainEvent } from "@/modules/shared";

export class ReviewEvidenceItemCreatedEvent
  implements DomainEvent<{ itemId: string; reviewId: string; source: string }>
{
  readonly eventName = "review_evidence_item_created";
  readonly occurredAt = new Date();

  constructor(
    private readonly itemId: string,
    private readonly reviewId: string,
    private readonly source: string,
  ) {}

  toPrimitives(): { itemId: string; reviewId: string; source: string } {
    return {
      itemId: this.itemId,
      reviewId: this.reviewId,
      source: this.source,
    };
  }
}
