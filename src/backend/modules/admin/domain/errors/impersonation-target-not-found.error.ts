import { DomainError } from "@/backend/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class ImpersonationTargetNotFoundError extends DomainError {
  constructor(targetUserId: string) {
    super(ErrorCode.IMPERSONATION_TARGET_NOT_FOUND, `Impersonation target not found: ${targetUserId}`);
    this.name = "ImpersonationTargetNotFoundError";
  }
}
