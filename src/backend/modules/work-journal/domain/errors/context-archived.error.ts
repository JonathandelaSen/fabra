import { DomainError } from "@/backend/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class ContextArchivedError extends DomainError {
  constructor(contextId: string) {
    super(ErrorCode["WORK_JOURNAL_CONTEXT_ARCHIVED"], `Work journal context is archived: ${contextId}`);
    this.name = "ContextArchivedError";
  }
}
