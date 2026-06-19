import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class SelfImpersonationError extends DomainError {
  constructor() {
    super(ErrorCode.SELF_IMPERSONATION, "Cannot impersonate yourself");
    this.name = "SelfImpersonationError";
  }
}
