import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class NextActionRequiredError extends DomainError {
  constructor() {
    super(
      ErrorCode.SELECTION_PROCESS_NEXT_ACTION_REQUIRED,
      "Next action is required when its date is provided"
    );
    this.name = "NextActionRequiredError";
  }
}
