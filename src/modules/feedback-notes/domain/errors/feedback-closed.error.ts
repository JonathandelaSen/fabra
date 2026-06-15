import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class FeedbackClosedError extends DomainError {
  constructor(feedbackId: string) {
    super(ErrorCode.FEEDBACK_CLOSED, `Feedback is closed: ${feedbackId}`);
    this.name = "FeedbackClosedError";
  }
}
