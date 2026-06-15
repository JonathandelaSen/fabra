import { DomainError } from "@/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class ReviewEvidenceItemNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.REVIEW_EVIDENCE_ITEM_NOT_FOUND, "Review evidence item not found.");
    this.name = "ReviewEvidenceItemNotFoundError";
  }
}
