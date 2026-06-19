import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class DefaultActivityContextDeleteError extends DomainError {
  constructor() {
    super(ErrorCode.DEFAULT_ACTIVITY_CONTEXT_DELETE, "The General activity context cannot be deleted.");
    this.name = "DefaultActivityContextDeleteError";
  }
}
