import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class CommitmentInvalidPropertyError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.COMMITMENT_INVALID_PROPERTY, message);
    this.name = "CommitmentInvalidPropertyError";
  }
}
