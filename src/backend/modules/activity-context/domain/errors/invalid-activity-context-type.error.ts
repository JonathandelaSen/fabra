import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidActivityContextTypeError extends DomainError {
  constructor(value: string) {
    super(
      ErrorCode.INVALID_ACTIVITY_CONTEXT_TYPE,
      `Invalid activity context type: ${value}`,
      { value },
    );
    this.name = "InvalidActivityContextTypeError";
  }
}
