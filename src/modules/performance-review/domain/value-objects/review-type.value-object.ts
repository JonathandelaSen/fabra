import { ErrorCode } from "@/shared/error-codes";
import { DomainError, ValueObject } from "@/modules/shared";

export const REVIEW_TYPE = {
  performanceReview: "performance_review",
  promotionCase: "promotion_case",
} as const;

export const REVIEW_TYPES = [
  REVIEW_TYPE.performanceReview,
  REVIEW_TYPE.promotionCase,
] as const;

export type ReviewTypeValue = (typeof REVIEW_TYPES)[number];

export class ReviewType extends ValueObject<ReviewTypeValue> {
  private constructor(private readonly value: ReviewTypeValue) {
    super();
  }

  static fromPrimitives(value: string): ReviewType {
    if (!REVIEW_TYPES.includes(value as ReviewTypeValue)) {
      throw new DomainError(ErrorCode.VALIDATION_FAILED, `Invalid review type: ${value}`);
    }
    return new ReviewType(value as ReviewTypeValue);
  }

  toPrimitives(): ReviewTypeValue {
    return this.value;
  }
}
