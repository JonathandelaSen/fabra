import { ValueObject } from "@/modules/shared";
import type { FeedbackContentMetricsPrimitives } from "./feedback-content-metrics.value-object";
import { FeedbackContentMetrics } from "./feedback-content-metrics.value-object";
import { ContentMetricsWindowDays } from "./content-metrics-window-days.value-object";

export interface FeedbackContentMetricsResultPrimitives {
  counts: FeedbackContentMetricsPrimitives;
  windowDays: number | null;
}

export class FeedbackContentMetricsResult extends ValueObject<FeedbackContentMetricsResultPrimitives> {
  private constructor(
    private readonly countsVo: FeedbackContentMetrics,
    private readonly windowDaysVo: ContentMetricsWindowDays
  ) {
    super();
  }

  static fromPrimitives(
    primitives: FeedbackContentMetricsResultPrimitives
  ): FeedbackContentMetricsResult {
    return new FeedbackContentMetricsResult(
      FeedbackContentMetrics.fromPrimitives(primitives.counts),
      ContentMetricsWindowDays.fromPrimitives(primitives.windowDays)
    );
  }

  toPrimitives(): FeedbackContentMetricsResultPrimitives {
    return {
      counts: this.countsVo.toPrimitives(),
      windowDays: this.windowDaysVo.toPrimitives(),
    };
  }

  get counts(): FeedbackContentMetrics {
    return this.countsVo;
  }

  get windowDays(): number | null {
    return this.windowDaysVo.toPrimitives();
  }
}
