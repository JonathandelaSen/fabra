import { ValueObject } from "@/backend/modules/shared";

export const workJournalContextStatuses = {
  active: "active",
  archived: "archived",
} as const;

export type ContextStatus =
  (typeof workJournalContextStatuses)[keyof typeof workJournalContextStatuses];

export class WorkJournalContextStatus extends ValueObject<ContextStatus> {
  private constructor(private readonly value: ContextStatus) {
    super();
  }

  static fromPrimitives(value: ContextStatus): WorkJournalContextStatus {
    if (
      value !== workJournalContextStatuses.active &&
      value !== workJournalContextStatuses.archived
    ) {
      throw new Error(`Invalid work journal context status: ${value}`);
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
