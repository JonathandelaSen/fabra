import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidActivityContextStatusError extends DomainError {
  constructor(value: string) {
    super(
      ErrorCode.INVALID_ACTIVITY_CONTEXT_STATUS,
      `Invalid activity context status: ${value}`,
      { value },
    );
    this.name = "InvalidActivityContextStatusError";
  }
}
