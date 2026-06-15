import { ValueObject } from "@/modules/shared";

export const workJournalEntryInputModes = {
  manual: "manual",
  aiAssisted: "ai_assisted",
} as const;

export type EntryInputMode =
  (typeof workJournalEntryInputModes)[keyof typeof workJournalEntryInputModes];

export class WorkJournalInputMode extends ValueObject<EntryInputMode> {
  private constructor(private readonly value: EntryInputMode) {
    super();
  }

  static fromPrimitives(value: EntryInputMode): WorkJournalInputMode {
    if (
      value !== workJournalEntryInputModes.manual &&
      value !== workJournalEntryInputModes.aiAssisted
    ) {
      throw new Error(`Invalid work journal input mode: ${value}`);
    }
    return new WorkJournalInputMode(value);
  }

  toPrimitives(): EntryInputMode {
    return this.value;
  }
}
