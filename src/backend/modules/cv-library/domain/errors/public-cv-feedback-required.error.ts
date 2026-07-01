import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class PublicCVFeedbackRequiredError extends DomainError {
  constructor() {
    super(ErrorCode.PUBLIC_CV_FEEDBACK_REQUIRED, "Public CV feedback text is required");
    this.name = "PublicCVFeedbackRequiredError";
  }
}
