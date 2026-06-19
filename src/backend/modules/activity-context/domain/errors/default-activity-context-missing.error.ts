import { DomainError } from "@/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class DefaultActivityContextMissingError extends DomainError {
  constructor() {
    super(ErrorCode.DEFAULT_ACTIVITY_CONTEXT_MISSING, "The user's General activity context is missing.");
    this.name = "DefaultActivityContextMissingError";
  }
}
