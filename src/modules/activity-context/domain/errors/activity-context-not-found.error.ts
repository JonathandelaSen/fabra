import { DomainError } from "@/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class ActivityContextNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.ACTIVITY_CONTEXT_NOT_FOUND, "Activity context not found.");
    this.name = "ActivityContextNotFoundError";
  }
}
