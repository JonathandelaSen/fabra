import { ErrorCode } from "@/shared/error-codes";
import { DomainError, ValueObject } from "@/backend/modules/shared";

export const REVIEW_TYPE = {
  performanceReview: "performance_review",
  promotionCase: "promotion_case",
} as const;

export const REVIEW_TYPES = [
  REVIEW_TYPE.performanceReview,
  REVIEW_TYPE.promotionCase,
] as const;

export type ReviewTypeValue = (typeof REVIEW_TYPES)[number];

export class InvalidReviewTypeError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_REVIEW_TYPE, `Invalid review type: ${value}`, { value });
    this.name = "InvalidReviewTypeError";
  }
}

export class ReviewType extends ValueObject<ReviewTypeValue> {
  private constructor(private readonly value: ReviewTypeValue) {
    super();
  }

  static fromPrimitives(value: string): ReviewType {
    if (!REVIEW_TYPES.includes(value as ReviewTypeValue)) {
      throw new InvalidReviewTypeError(value);
    }
    return new ReviewType(value as ReviewTypeValue);
  }

  static performanceReview(): ReviewType {
    return new ReviewType(REVIEW_TYPE.performanceReview);
  }

  static promotionCase(): ReviewType {
    return new ReviewType(REVIEW_TYPE.promotionCase);
  }

  isPerformanceReview(): boolean {
    return this.value === REVIEW_TYPE.performanceReview;
  }

  isPromotionCase(): boolean {
    return this.value === REVIEW_TYPE.promotionCase;
  }

  toPrimitives(): ReviewTypeValue {
    return this.value;
  }
}
