import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class CommitmentTargetDateBeforeStartDateError extends DomainError {
  constructor() {
    super(
      ErrorCode.COMMITMENT_TARGET_DATE_BEFORE_START_DATE,
      "Target date cannot be before start date.",
    );
    this.name = "CommitmentTargetDateBeforeStartDateError";
  }
}
