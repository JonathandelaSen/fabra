import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class EntryNotFoundError extends DomainError {
  constructor(entryId: string) {
    super(ErrorCode["WORK_JOURNAL_ENTRY_NOT_FOUND"], `Work journal entry not found: ${entryId}`);
    this.name = "EntryNotFoundError";
  }
}
