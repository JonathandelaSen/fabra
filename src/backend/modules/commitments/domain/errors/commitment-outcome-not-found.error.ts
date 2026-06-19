import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class CommitmentOutcomeNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.COMMITMENT_OUTCOME_NOT_FOUND, "Commitment outcome not found.");
    this.name = "CommitmentOutcomeNotFoundError";
  }
}
