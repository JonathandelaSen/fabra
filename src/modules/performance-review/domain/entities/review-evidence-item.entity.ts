import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/modules/shared";
import { ReviewEvidenceItemCreatedEvent } from "../events/review-evidence-item-created.event";
import { ReviewEvidenceItemDeletedEvent } from "../events/review-evidence-item-deleted.event";
import { ReviewEvidenceItemUpdatedEvent } from "../events/review-evidence-item-updated.event";
import { EvidenceContent } from "../value-objects/evidence-content.value-object";
import {
  EvidenceSource,
  type EvidenceSourceValue,
} from "../value-objects/evidence-source.value-object";
import { PerformanceReviewId } from "../value-objects/performance-review-id.value-object";
import { ReviewEvidenceItemId } from "../value-objects/review-evidence-item-id.value-object";

export interface ReviewEvidenceItemPrimitives {
  id: string;
  userId: string;
  reviewId: string;
  source: EvidenceSourceValue;
  sourceId: string | null;
  content: string;
  highlighted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewEvidenceItemCreateParams {
  id: ReviewEvidenceItemId;
  userId: UserIdType;
  reviewId: PerformanceReviewId;
  source: EvidenceSource;
  sourceId: string | null;
  content: EvidenceContent;
  highlighted: boolean;
  position: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class ReviewEvidenceItem extends AggregateRoot {
  private constructor(
    private readonly itemId: ReviewEvidenceItemId,
    private readonly ownerId: UserIdType,
    private readonly itemReviewId: PerformanceReviewId,
    private readonly itemSource: EvidenceSource,
    private readonly itemSourceId: string | null,
    private itemContent: EvidenceContent,
    private itemHighlighted: boolean,
    private itemPosition: number,
    private readonly itemCreatedAt: Timestamp,
    private itemUpdatedAt: Timestamp,
  ) {
    super();
  }

  static create(params: ReviewEvidenceItemCreateParams): ReviewEvidenceItem {
    const item = new ReviewEvidenceItem(
      params.id,
      params.userId,
      params.reviewId,
      params.source,
      params.sourceId,
      params.content,
      params.highlighted,
      params.position,
      params.createdAt,
      params.updatedAt,
    );
    item.recordDomainEvent(
      new ReviewEvidenceItemCreatedEvent(
        item.id,
        params.reviewId.toPrimitives(),
        params.source.toPrimitives(),
      ),
    );
    return item;
  }

  static fromPrimitives(
    primitives: ReviewEvidenceItemPrimitives,
  ): ReviewEvidenceItem {
    return new ReviewEvidenceItem(
      ReviewEvidenceItemId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      PerformanceReviewId.fromPrimitives(primitives.reviewId),
      EvidenceSource.fromPrimitives(primitives.source),
      primitives.sourceId,
      EvidenceContent.fromPrimitives(primitives.content),
      primitives.highlighted,
      primitives.position,
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt),
    );
  }

  get id(): string {
    return this.itemId.toPrimitives();
  }

  get reviewId(): string {
    return this.itemReviewId.toPrimitives();
  }

  highlight(updatedAt: Timestamp): void {
    this.itemHighlighted = true;
    this.itemUpdatedAt = updatedAt;
    this.recordDomainEvent(
      new ReviewEvidenceItemUpdatedEvent(this.id, ["highlighted"]),
    );
  }

  unhighlight(updatedAt: Timestamp): void {
    this.itemHighlighted = false;
    this.itemUpdatedAt = updatedAt;
    this.recordDomainEvent(
      new ReviewEvidenceItemUpdatedEvent(this.id, ["highlighted"]),
    );
  }

  updateContent(content: EvidenceContent, updatedAt: Timestamp): void {
    this.itemContent = content;
    this.itemUpdatedAt = updatedAt;
    this.recordDomainEvent(
      new ReviewEvidenceItemUpdatedEvent(this.id, ["content"]),
    );
  }

  reorder(position: number, updatedAt: Timestamp): void {
    this.itemPosition = position;
    this.itemUpdatedAt = updatedAt;
    this.recordDomainEvent(
      new ReviewEvidenceItemUpdatedEvent(this.id, ["position"]),
    );
  }

  delete(): void {
    this.recordDomainEvent(new ReviewEvidenceItemDeletedEvent(this.id));
  }

  toPrimitives(): ReviewEvidenceItemPrimitives {
    return {
      id: this.id,
      userId: this.ownerId.toPrimitives(),
      reviewId: this.reviewId,
      source: this.itemSource.toPrimitives(),
      sourceId: this.itemSourceId,
      content: this.itemContent.toPrimitives(),
      highlighted: this.itemHighlighted,
      position: this.itemPosition,
      createdAt: this.itemCreatedAt.toPrimitives(),
      updatedAt: this.itemUpdatedAt.toPrimitives(),
    };
  }
}
