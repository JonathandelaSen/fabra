import {
  AggregateRoot,
  EntityId,
  IsoDate,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { PerformanceReviewCompletedEvent } from "../events/performance-review-completed.event";
import { PerformanceReviewCreatedEvent } from "../events/performance-review-created.event";
import { PerformanceReviewDeletedEvent } from "../events/performance-review-deleted.event";
import { PerformanceReviewUpdatedEvent } from "../events/performance-review-updated.event";
import { SelfAssessmentAttachedEvent } from "../events/self-assessment-attached.event";
import { PerformanceReviewId } from "../value-objects/performance-review-id.value-object";
import { ReviewStatus } from "../value-objects/review-status.value-object";
import { ReviewTitle } from "../value-objects/review-title.value-object";
import { ReviewType } from "../value-objects/review-type.value-object";
import {
  SelfAssessmentMode,
  type SelfAssessmentModeValue,
} from "../value-objects/self-assessment-mode.value-object";
import type { ReviewStatusValue } from "../value-objects/review-status.value-object";
import type { ReviewTypeValue } from "../value-objects/review-type.value-object";

export interface PerformanceReviewPrimitives {
  id: string;
  userId: string;
  activityContextId: string | null;
  title: string;
  reviewType: ReviewTypeValue;
  reviewDate: string;
  periodStart: string;
  periodEnd: string;
  status: ReviewStatusValue;
  selfAssessmentContent: string | null;
  selfAssessmentGeneratedAt: string | null;
  selfAssessmentMode: SelfAssessmentModeValue | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReviewCreateParams {
  id: PerformanceReviewId;
  userId: UserIdType;
  activityContextId: EntityId | null;
  title: ReviewTitle;
  reviewType: ReviewType;
  reviewDate: IsoDate;
  periodStart: IsoDate;
  periodEnd: IsoDate;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UpdatePerformanceReviewDetails {
  activityContextId?: EntityId | null;
  title?: ReviewTitle;
  reviewType?: ReviewType;
  reviewDate?: IsoDate;
  periodStart?: IsoDate;
  periodEnd?: IsoDate;
  updatedAt: Timestamp;
}

export class PerformanceReview extends AggregateRoot {
  private constructor(
    private readonly reviewId: PerformanceReviewId,
    private readonly ownerId: UserIdType,
    private reviewActivityContextId: EntityId | null,
    private reviewTitle: ReviewTitle,
    private reviewType: ReviewType,
    private reviewDate: IsoDate,
    private reviewPeriodStart: IsoDate,
    private reviewPeriodEnd: IsoDate,
    private reviewStatus: ReviewStatus,
    private reviewSelfAssessmentContent: string | null,
    private reviewSelfAssessmentGeneratedAt: Timestamp | null,
    private reviewSelfAssessmentMode: SelfAssessmentMode | null,
    private readonly reviewCreatedAt: Timestamp,
    private reviewUpdatedAt: Timestamp,
  ) {
    super();
  }

  static create(params: PerformanceReviewCreateParams): PerformanceReview {
    const review = new PerformanceReview(
      params.id,
      params.userId,
      params.activityContextId,
      params.title,
      params.reviewType,
      params.reviewDate,
      params.periodStart,
      params.periodEnd,
      ReviewStatus.fromPrimitives("draft"),
      null,
      null,
      null,
      params.createdAt,
      params.updatedAt,
    );
    review.recordDomainEvent(new PerformanceReviewCreatedEvent(review.id));
    return review;
  }

  static fromPrimitives(
    primitives: PerformanceReviewPrimitives,
  ): PerformanceReview {
    return new PerformanceReview(
      PerformanceReviewId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      primitives.activityContextId
        ? EntityId.fromPrimitives(primitives.activityContextId)
        : null,
      ReviewTitle.fromPrimitives(primitives.title),
      ReviewType.fromPrimitives(primitives.reviewType),
      IsoDate.fromPrimitives(primitives.reviewDate),
      IsoDate.fromPrimitives(primitives.periodStart),
      IsoDate.fromPrimitives(primitives.periodEnd),
      ReviewStatus.fromPrimitives(primitives.status),
      primitives.selfAssessmentContent,
      primitives.selfAssessmentGeneratedAt
        ? Timestamp.fromPrimitives(primitives.selfAssessmentGeneratedAt)
        : null,
      primitives.selfAssessmentMode
        ? SelfAssessmentMode.fromPrimitives(primitives.selfAssessmentMode)
        : null,
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt),
    );
  }

  get id(): string {
    return this.reviewId.toPrimitives();
  }

  get userId(): string {
    return this.ownerId.toPrimitives();
  }

  updateDetails(input: UpdatePerformanceReviewDetails): void {
    const fields: string[] = [];
    if (input.activityContextId !== undefined) {
      this.reviewActivityContextId = input.activityContextId;
      fields.push("activityContextId");
    }
    if (input.title) {
      this.reviewTitle = input.title;
      fields.push("title");
    }
    if (input.reviewType) {
      this.reviewType = input.reviewType;
      fields.push("reviewType");
    }
    if (input.reviewDate) {
      this.reviewDate = input.reviewDate;
      fields.push("reviewDate");
    }
    if (input.periodStart) {
      this.reviewPeriodStart = input.periodStart;
      fields.push("periodStart");
    }
    if (input.periodEnd) {
      this.reviewPeriodEnd = input.periodEnd;
      fields.push("periodEnd");
    }
    this.reviewUpdatedAt = input.updatedAt;
    if (fields.length > 0) {
      this.recordDomainEvent(
        new PerformanceReviewUpdatedEvent(this.id, fields),
      );
    }
  }

  attachSelfAssessment(input: {
    content: string;
    mode: SelfAssessmentMode;
    generatedAt: Timestamp;
    updatedAt: Timestamp;
  }): void {
    this.reviewSelfAssessmentContent = input.content;
    this.reviewSelfAssessmentMode = input.mode;
    this.reviewSelfAssessmentGeneratedAt = input.generatedAt;
    this.reviewUpdatedAt = input.updatedAt;
    if (this.reviewStatus.toPrimitives() === "draft") {
      this.reviewStatus = ReviewStatus.fromPrimitives("prepared");
    }
    this.recordDomainEvent(
      new SelfAssessmentAttachedEvent(this.id, input.mode.toPrimitives()),
    );
  }

  complete(updatedAt: Timestamp): void {
    this.reviewStatus = ReviewStatus.fromPrimitives("completed");
    this.reviewUpdatedAt = updatedAt;
    this.recordDomainEvent(new PerformanceReviewCompletedEvent(this.id));
  }

  delete(): void {
    this.recordDomainEvent(new PerformanceReviewDeletedEvent(this.id));
  }

  toPrimitives(): PerformanceReviewPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      activityContextId:
        this.reviewActivityContextId?.toPrimitives() ?? null,
      title: this.reviewTitle.toPrimitives(),
      reviewType: this.reviewType.toPrimitives(),
      reviewDate: this.reviewDate.toPrimitives(),
      periodStart: this.reviewPeriodStart.toPrimitives(),
      periodEnd: this.reviewPeriodEnd.toPrimitives(),
      status: this.reviewStatus.toPrimitives(),
      selfAssessmentContent: this.reviewSelfAssessmentContent,
      selfAssessmentGeneratedAt:
        this.reviewSelfAssessmentGeneratedAt?.toPrimitives() ?? null,
      selfAssessmentMode: this.reviewSelfAssessmentMode?.toPrimitives() ?? null,
      createdAt: this.reviewCreatedAt.toPrimitives(),
      updatedAt: this.reviewUpdatedAt.toPrimitives(),
    };
  }
}
