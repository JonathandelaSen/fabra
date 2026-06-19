import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class ReceivedFeedbackNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.RECEIVED_FEEDBACK_NOT_FOUND, "Received feedback not found.");
    this.name = "ReceivedFeedbackNotFoundError";
  }
}
