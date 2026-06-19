import { ValueObject } from "@/modules/shared";

export class WorkJournalDraft extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new Error("Work journal draft cannot be empty.");
  }

  static fromPrimitives(value: string): WorkJournalDraft {
    return new WorkJournalDraft(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
