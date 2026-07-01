import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class CommitmentInvalidDateError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.COMMITMENT_INVALID_DATE, message);
    this.name = "CommitmentInvalidDateError";
  }
}
