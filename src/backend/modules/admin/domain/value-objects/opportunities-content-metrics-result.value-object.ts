import { ValueObject } from "@/backend/modules/shared";
import type { OpportunitiesContentMetricsPrimitives } from "./opportunities-content-metrics.value-object";
import { OpportunitiesContentMetrics } from "./opportunities-content-metrics.value-object";
import { ContentMetricsWindowDays } from "./content-metrics-window-days.value-object";

export interface GetOpportunitiesContentMetricsResultPrimitives {
  counts: OpportunitiesContentMetricsPrimitives;
  windowDays: number | null;
}

export class OpportunitiesContentMetricsResult extends ValueObject<GetOpportunitiesContentMetricsResultPrimitives> {
  private constructor(
    private readonly countsVo: OpportunitiesContentMetrics,
    private readonly windowDaysVo: ContentMetricsWindowDays
  ) {
    super();
  }

  static fromPrimitives(
    primitives: GetOpportunitiesContentMetricsResultPrimitives
  ): OpportunitiesContentMetricsResult {
    return new OpportunitiesContentMetricsResult(
      OpportunitiesContentMetrics.fromPrimitives(primitives.counts),
      ContentMetricsWindowDays.fromPrimitives(primitives.windowDays)
    );
  }

  toPrimitives(): GetOpportunitiesContentMetricsResultPrimitives {
    return {
      counts: this.countsVo.toPrimitives(),
      windowDays: this.windowDaysVo.toPrimitives(),
    };
  }

  get counts(): OpportunitiesContentMetrics {
    return this.countsVo;
  }

  get windowDays(): number | null {
    return this.windowDaysVo.toPrimitives();
  }
}
