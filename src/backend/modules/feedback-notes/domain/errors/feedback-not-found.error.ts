import { DomainError } from "@/backend/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class FeedbackNotFoundError extends DomainError {
  constructor(feedbackId: string) {
    super(ErrorCode.FEEDBACK_NOT_FOUND, `Feedback not found: ${feedbackId}`);
    this.name = "FeedbackNotFoundError";
  }
}
