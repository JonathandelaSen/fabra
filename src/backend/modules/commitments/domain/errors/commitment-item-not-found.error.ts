import { DomainError } from "@/backend/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class CommitmentItemNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.COMMITMENT_ITEM_NOT_FOUND, "Commitment item not found.");
    this.name = "CommitmentItemNotFoundError";
  }
}
