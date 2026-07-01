import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class CommitmentInvalidDateError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.COMMITMENT_INVALID_DATE, message);
    this.name = "CommitmentInvalidDateError";
  }
}

export class CommitmentTargetDateBeforeStartDateError extends DomainError {
  constructor() {
    super(
      ErrorCode.COMMITMENT_TARGET_DATE_BEFORE_START_DATE,
      "Target date cannot be before start date."
    );
    this.name = "CommitmentTargetDateBeforeStartDateError";
  }
}

export class CommitmentInvalidPropertyError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.COMMITMENT_INVALID_PROPERTY, message);
    this.name = "CommitmentInvalidPropertyError";
  }
}
