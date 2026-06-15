import { ValueObject } from "@/modules/shared";

export const workJournalContextTypes = {
  employment: "employment",
  project: "project",
  personal: "personal",
  other: "other",
} as const;

export type ContextType =
  (typeof workJournalContextTypes)[keyof typeof workJournalContextTypes];

export class WorkJournalContextType extends ValueObject<ContextType> {
  private constructor(private readonly value: ContextType) {
    super();
  }

  static fromPrimitives(value: ContextType): WorkJournalContextType {
    if (!Object.values(workJournalContextTypes).includes(value)) {
      throw new Error(`Invalid work journal context type: ${value}`);
    }
    return new WorkJournalContextType(value);
  }

  toPrimitives(): ContextType {
    return this.value;
  }
}
