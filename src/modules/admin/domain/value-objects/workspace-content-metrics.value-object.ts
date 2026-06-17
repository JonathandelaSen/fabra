import { Counter, ValueObject } from "@/modules/shared";

export interface WorkspaceContentMetricsPrimitives {
  workJournalEntries: number;
  commitments: number;
  activityContexts: number;
}

export class WorkspaceContentMetrics extends ValueObject<WorkspaceContentMetricsPrimitives> {
  private constructor(
    private readonly workJournalEntriesCount: Counter,
    private readonly commitmentsCount: Counter,
    private readonly activityContextsCount: Counter
  ) {
    super();
  }

  static fromPrimitives(primitives: WorkspaceContentMetricsPrimitives): WorkspaceContentMetrics {
    return new WorkspaceContentMetrics(
      Counter.fromPrimitives(primitives.workJournalEntries),
      Counter.fromPrimitives(primitives.commitments),
      Counter.fromPrimitives(primitives.activityContexts)
    );
  }

  toPrimitives(): WorkspaceContentMetricsPrimitives {
    return {
      workJournalEntries: this.workJournalEntriesCount.toPrimitives(),
      commitments: this.commitmentsCount.toPrimitives(),
      activityContexts: this.activityContextsCount.toPrimitives(),
    };
  }

  get workJournalEntries(): number {
    return this.workJournalEntriesCount.toPrimitives();
  }

  get commitments(): number {
    return this.commitmentsCount.toPrimitives();
  }

  get activityContexts(): number {
    return this.activityContextsCount.toPrimitives();
  }
}
