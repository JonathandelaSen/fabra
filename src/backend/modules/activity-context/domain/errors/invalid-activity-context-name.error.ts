import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidActivityContextNameError extends DomainError {
  constructor(value: string, message: string) {
    super(ErrorCode.INVALID_ACTIVITY_CONTEXT_NAME, message, { value });
    this.name = "InvalidActivityContextNameError";
  }
}
