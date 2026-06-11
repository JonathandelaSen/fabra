import { DomainError } from "@/modules/shared";

export class PerformanceReviewNotFoundError extends DomainError {
  constructor() {
    super("Performance review not found.");
    this.name = "PerformanceReviewNotFoundError";
  }
}
