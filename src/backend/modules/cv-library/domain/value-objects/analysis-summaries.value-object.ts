import { ValueObject } from "@/backend/modules/shared";
import {
  OFFER_STATUSES,
  type AnalysisMode,
  type AnalysisSummary,
  type AnalysisSummaryPrimitives,
  type OfferStatus,
} from "@/lib/analysis-types";

function hydrateAnalysisSummary(
  primitives: AnalysisSummaryPrimitives,
): AnalysisSummary {
  const analysisMode: AnalysisMode =
    primitives.analysis_mode === "job_match" ? "job_match" : "general";
  const offerStatus: OfferStatus | null =
    primitives.offer_status !== null &&
    OFFER_STATUSES.includes(primitives.offer_status as OfferStatus)
      ? (primitives.offer_status as OfferStatus)
      : null;

  return {
    ...primitives,
    analysis_mode: analysisMode,
    offer_status: offerStatus,
  };
}

export class AnalysisSummaries extends ValueObject<unknown> {
  private constructor(private readonly values: readonly AnalysisSummary[]) {
    super();
  }

  static fromPrimitives(
    values: AnalysisSummaryPrimitives[],
  ): AnalysisSummaries {
    return new AnalysisSummaries(values.map(hydrateAnalysisSummary));
  }

  static fromValues(values: AnalysisSummary[]): AnalysisSummaries {
    return new AnalysisSummaries(values.map((value) => ({ ...value })));
  }

  toPrimitives(): AnalysisSummaryPrimitives[] {
    return this.values.map((value) => ({ ...value }));
  }

  toValues(): AnalysisSummary[] {
    return this.values.map((value) => ({ ...value }));
  }
}
