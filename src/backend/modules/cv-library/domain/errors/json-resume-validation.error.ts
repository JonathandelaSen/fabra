import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class JsonResumeValidationError extends DomainError {
  constructor(reason: string) {
    super(
      ErrorCode.JSON_RESUME_VALIDATION_FAILED,
      `Invalid JSON Resume: ${reason}`,
    );
    this.name = "JsonResumeValidationError";
  }
}
