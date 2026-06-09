import { DomainError } from "@/modules/shared/domain/errors/domain-error";

export class ImpersonationTargetNotFoundError extends DomainError {
  constructor(targetUserId: string) {
    super(`Impersonation target not found: ${targetUserId}`);
    this.name = "ImpersonationTargetNotFoundError";
  }
}
