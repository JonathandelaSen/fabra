import type { AnalysisSummary, AnalysisSummaryPrimitives } from "@/lib/analysis-types";
import { ValueObject } from "@/modules/shared";
import {
  CVDeletionStatus,
  type CVDeletionStatusPrimitives,
} from "./cv-deletion-status.value-object";

export interface CVDeletionOutcomePrimitives {
  status: CVDeletionStatusPrimitives;
  analyses: AnalysisSummaryPrimitives[];
}

export class CVDeletionOutcome extends ValueObject<CVDeletionOutcomePrimitives> {
  private constructor(
    private readonly statusValue: CVDeletionStatus,
    private readonly analysesValue: AnalysisSummary[]
  ) {
    super();
  }

  static deleted(): CVDeletionOutcome {
    return new CVDeletionOutcome(CVDeletionStatus.deleted(), []);
  }

  static notFound(): CVDeletionOutcome {
    return new CVDeletionOutcome(CVDeletionStatus.notFound(), []);
  }

  static inUse(analyses: AnalysisSummary[]): CVDeletionOutcome {
    return new CVDeletionOutcome(CVDeletionStatus.inUse(), analyses);
  }

  static fromPrimitives(
    primitives: CVDeletionOutcomePrimitives
  ): CVDeletionOutcome {
    return new CVDeletionOutcome(
      CVDeletionStatus.fromPrimitives(primitives.status),
      primitives.analyses
    );
  }

  toPrimitives(): CVDeletionOutcomePrimitives {
    return {
      status: this.statusValue.toPrimitives(),
      analyses: this.analysesValue,
    };
  }

  get status(): CVDeletionStatus {
    return this.statusValue;
  }

  get analyses(): AnalysisSummary[] {
    return this.analysesValue;
  }
}
