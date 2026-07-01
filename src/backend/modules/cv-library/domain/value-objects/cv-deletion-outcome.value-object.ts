import type { AnalysisSummary, AnalysisSummaryPrimitives } from "@/lib/analysis-types";
import { ValueObject } from "@/backend/modules/shared";
import { AnalysisSummaries } from "./analysis-summaries.value-object";
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
    private readonly analysesValue: AnalysisSummaries,
  ) {
    super();
  }

  static deleted(): CVDeletionOutcome {
    return new CVDeletionOutcome(CVDeletionStatus.deleted(), AnalysisSummaries.fromValues([]));
  }

  static notFound(): CVDeletionOutcome {
    return new CVDeletionOutcome(CVDeletionStatus.notFound(), AnalysisSummaries.fromValues([]));
  }

  static inUse(analyses: AnalysisSummary[]): CVDeletionOutcome {
    return new CVDeletionOutcome(CVDeletionStatus.inUse(), AnalysisSummaries.fromValues(analyses));
  }

  static fromPrimitives(
    primitives: CVDeletionOutcomePrimitives,
  ): CVDeletionOutcome {
    return new CVDeletionOutcome(
      CVDeletionStatus.fromPrimitives(primitives.status),
      AnalysisSummaries.fromPrimitives(primitives.analyses),
    );
  }

  toPrimitives(): CVDeletionOutcomePrimitives {
    return {
      status: this.statusValue.toPrimitives(),
      analyses: this.analysesValue.toPrimitives(),
    };
  }

  get status(): CVDeletionStatus {
    return this.statusValue;
  }

  get analyses(): AnalysisSummary[] {
    return this.analysesValue.toValues();
  }
}
