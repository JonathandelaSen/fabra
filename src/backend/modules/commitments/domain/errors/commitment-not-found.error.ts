import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class CommitmentNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.COMMITMENT_NOT_FOUND, "Commitment not found.");
    this.name = "CommitmentNotFoundError";
  }
}
