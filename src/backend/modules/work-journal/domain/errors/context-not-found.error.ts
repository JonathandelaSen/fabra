import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class ContextNotFoundError extends DomainError {
  constructor(contextId: string) {
    super(ErrorCode["WORK_JOURNAL_CONTEXT_NOT_FOUND"], `Work journal context not found: ${contextId}`);
    this.name = "ContextNotFoundError";
  }
}
