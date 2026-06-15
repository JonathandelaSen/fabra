import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class FeedbackEntriesRequiredError extends DomainError {
  constructor(feedbackId: string) {
    super(ErrorCode.FEEDBACK_ENTRIES_REQUIRED, `Feedback requires at least one entry: ${feedbackId}`);
    this.name = "FeedbackEntriesRequiredError";
  }
}
