import { ValueObject } from "@/backend/modules/shared";
import {
  AnalysisContentMetrics,
  type AnalysisContentMetricsPrimitives,
} from "./analysis-content-metrics.value-object";
import { ContentMetricsWindowDays } from "./content-metrics-window-days.value-object";

export interface AnalysisContentMetricsReportPrimitives {
  counts: AnalysisContentMetricsPrimitives;
  windowDays: number | null;
}

export class AnalysisContentMetricsReport extends ValueObject<AnalysisContentMetricsReportPrimitives> {
  private constructor(
    private readonly contentCounts: AnalysisContentMetrics,
    private readonly windowDaysValue: ContentMetricsWindowDays
  ) {
    super();
  }

  static fromPrimitives(
    primitives: AnalysisContentMetricsReportPrimitives
  ): AnalysisContentMetricsReport {
    return new AnalysisContentMetricsReport(
      AnalysisContentMetrics.fromPrimitives(primitives.counts),
      ContentMetricsWindowDays.fromPrimitives(primitives.windowDays)
    );
  }

  static create(
    counts: AnalysisContentMetrics,
    windowDays: number | null
  ): AnalysisContentMetricsReport {
    return new AnalysisContentMetricsReport(
      counts,
      ContentMetricsWindowDays.fromPrimitives(windowDays)
    );
  }

  toPrimitives(): AnalysisContentMetricsReportPrimitives {
    return {
      counts: this.contentCounts.toPrimitives(),
      windowDays: this.windowDaysValue.toPrimitives(),
    };
  }

  get counts(): AnalysisContentMetrics {
    return this.contentCounts;
  }

  get windowDays(): number | null {
    return this.windowDaysValue.toPrimitives();
  }
}
