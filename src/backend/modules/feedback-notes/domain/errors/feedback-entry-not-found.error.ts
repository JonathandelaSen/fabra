import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class FeedbackEntryNotFoundError extends DomainError {
  constructor(entryId: string) {
    super(ErrorCode.FEEDBACK_ENTRY_NOT_FOUND, `Feedback entry not found: ${entryId}`);
    this.name = "FeedbackEntryNotFoundError";
  }
}
