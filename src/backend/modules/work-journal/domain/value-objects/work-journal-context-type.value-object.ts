import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export const workJournalContextTypes = {
  employment: "employment",
  project: "project",
  personal: "personal",
  other: "other",
} as const;

export type ContextType =
  (typeof workJournalContextTypes)[keyof typeof workJournalContextTypes];

class InvalidContextTypeError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.WORK_JOURNAL_INVALID_CONTEXT_TYPE, `Invalid work journal context type: ${value}`, { value });
    this.name = "InvalidContextTypeError";
  }
}

export class WorkJournalContextType extends ValueObject<ContextType> {
  private constructor(private readonly value: ContextType) {
    super();
  }

  static fromPrimitives(value: string): WorkJournalContextType {
    if (!Object.values(workJournalContextTypes).includes(value as ContextType)) {
      throw new InvalidContextTypeError(value);
    }
    return new WorkJournalContextType(value as ContextType);
  }

  static employment(): WorkJournalContextType {
    return new WorkJournalContextType(workJournalContextTypes.employment);
  }

  static project(): WorkJournalContextType {
    return new WorkJournalContextType(workJournalContextTypes.project);
  }

  static personal(): WorkJournalContextType {
    return new WorkJournalContextType(workJournalContextTypes.personal);
  }

  static other(): WorkJournalContextType {
    return new WorkJournalContextType(workJournalContextTypes.other);
  }

  isEmployment(): boolean {
    return this.value === workJournalContextTypes.employment;
  }

  isProject(): boolean {
    return this.value === workJournalContextTypes.project;
  }

  isPersonal(): boolean {
    return this.value === workJournalContextTypes.personal;
  }

  isOther(): boolean {
    return this.value === workJournalContextTypes.other;
  }

  toPrimitives(): ContextType {
    return this.value;
  }
}
