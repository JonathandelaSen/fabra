import { ValueObject } from "@/backend/modules/shared";
import type { CVContentMetricsPrimitives } from "./cv-content-metrics.value-object";
import { CVContentMetrics } from "./cv-content-metrics.value-object";
import { ContentMetricsWindowDays } from "./content-metrics-window-days.value-object";

export interface CVContentMetricsResultPrimitives {
  counts: CVContentMetricsPrimitives;
  windowDays: number | null;
}

export class CVContentMetricsResult extends ValueObject<CVContentMetricsResultPrimitives> {
  private constructor(
    private readonly countsVo: CVContentMetrics,
    private readonly windowDaysVo: ContentMetricsWindowDays
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVContentMetricsResultPrimitives
  ): CVContentMetricsResult {
    return new CVContentMetricsResult(
      CVContentMetrics.fromPrimitives(primitives.counts),
      ContentMetricsWindowDays.fromPrimitives(primitives.windowDays)
    );
  }

  toPrimitives(): CVContentMetricsResultPrimitives {
    return {
      counts: this.countsVo.toPrimitives(),
      windowDays: this.windowDaysVo.toPrimitives(),
    };
  }

  get counts(): CVContentMetrics {
    return this.countsVo;
  }

  get windowDays(): number | null {
    return this.windowDaysVo.toPrimitives();
  }
}
