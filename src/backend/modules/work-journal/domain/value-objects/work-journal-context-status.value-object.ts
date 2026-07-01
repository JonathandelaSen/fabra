import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export const workJournalContextStatuses = {
  active: "active",
  archived: "archived",
} as const;

export type ContextStatus =
  (typeof workJournalContextStatuses)[keyof typeof workJournalContextStatuses];

class InvalidContextStatusError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.WORK_JOURNAL_INVALID_CONTEXT_STATUS, `Invalid work journal context status: ${value}`, { value });
    this.name = "InvalidContextStatusError";
  }
}

export class WorkJournalContextStatus extends ValueObject<ContextStatus> {
  private constructor(private readonly value: ContextStatus) {
    super();
  }

  static fromPrimitives(value: ContextStatus): WorkJournalContextStatus {
    if (
      value !== workJournalContextStatuses.active &&
      value !== workJournalContextStatuses.archived
    ) {
      throw new InvalidContextStatusError(value);
    }
    return new WorkJournalContextStatus(value);
  }

  static active(): WorkJournalContextStatus {
    return new WorkJournalContextStatus(workJournalContextStatuses.active);
  }

  static archived(): WorkJournalContextStatus {
    return new WorkJournalContextStatus(workJournalContextStatuses.archived);
  }

  isActive(): boolean {
    return this.value === workJournalContextStatuses.active;
  }

  isArchived(): boolean {
    return this.value === workJournalContextStatuses.archived;
  }

  toPrimitives(): ContextStatus {
    return this.value;
  }
}
