import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class PerformanceReviewNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.PERFORMANCE_REVIEW_NOT_FOUND, "Performance review not found.");
    this.name = "PerformanceReviewNotFoundError";
  }
}
