import { DomainError } from "@/modules/shared";

export class ReviewEvidenceItemNotFoundError extends DomainError {
  constructor() {
    super("Review evidence item not found.");
    this.name = "ReviewEvidenceItemNotFoundError";
  }
}
