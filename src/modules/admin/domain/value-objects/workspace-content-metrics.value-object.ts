import { ValueObject } from "@/modules/shared";

export interface WorkspaceContentMetricsPrimitives {
  workJournalEntries: number;
  commitments: number;
  activityContexts: number;
}

export class WorkspaceContentMetrics extends ValueObject<WorkspaceContentMetricsPrimitives> {
  private constructor(
    private readonly workJournalEntriesCount: number,
    private readonly commitmentsCount: number,
    private readonly activityContextsCount: number
  ) {
    super();
  }

  static fromPrimitives(primitives: WorkspaceContentMetricsPrimitives): WorkspaceContentMetrics {
    return new WorkspaceContentMetrics(
      primitives.workJournalEntries,
      primitives.commitments,
      primitives.activityContexts
    );
  }

  toPrimitives(): WorkspaceContentMetricsPrimitives {
    return {
      workJournalEntries: this.workJournalEntriesCount,
      commitments: this.commitmentsCount,
      activityContexts: this.activityContextsCount,
    };
  }

  get workJournalEntries(): number {
    return this.workJournalEntriesCount;
  }

  get commitments(): number {
    return this.commitmentsCount;
  }

  get activityContexts(): number {
    return this.activityContextsCount;
  }
}
