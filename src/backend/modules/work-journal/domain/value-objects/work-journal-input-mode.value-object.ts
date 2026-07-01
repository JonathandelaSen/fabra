import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export const workJournalEntryInputModes = {
  manual: "manual",
  aiAssisted: "ai_assisted",
} as const;

export type EntryInputMode =
  (typeof workJournalEntryInputModes)[keyof typeof workJournalEntryInputModes];

class InvalidInputModeError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.WORK_JOURNAL_INVALID_INPUT_MODE, `Invalid work journal input mode: ${value}`, { value });
    this.name = "InvalidInputModeError";
  }
}

export class WorkJournalInputMode extends ValueObject<EntryInputMode> {
  private constructor(private readonly value: EntryInputMode) {
    super();
  }

  static fromPrimitives(value: EntryInputMode): WorkJournalInputMode {
    if (
      value !== workJournalEntryInputModes.manual &&
      value !== workJournalEntryInputModes.aiAssisted
    ) {
      throw new InvalidInputModeError(value);
    }
    return new WorkJournalInputMode(value);
  }

  static manual(): WorkJournalInputMode {
    return new WorkJournalInputMode(workJournalEntryInputModes.manual);
  }

  static aiAssisted(): WorkJournalInputMode {
    return new WorkJournalInputMode(workJournalEntryInputModes.aiAssisted);
  }

  isManual(): boolean {
    return this.value === workJournalEntryInputModes.manual;
  }

  isAiAssisted(): boolean {
    return this.value === workJournalEntryInputModes.aiAssisted;
  }

  toPrimitives(): EntryInputMode {
    return this.value;
  }
}
