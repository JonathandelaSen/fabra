import { ValueObject } from "@/modules/shared";
import type { WorkspaceContentMetricsPrimitives } from "./workspace-content-metrics.value-object";
import { WorkspaceContentMetrics } from "./workspace-content-metrics.value-object";
import { ContentMetricsWindowDays } from "./content-metrics-window-days.value-object";

export interface WorkspaceContentMetricsResultPrimitives {
  counts: WorkspaceContentMetricsPrimitives;
  windowDays: number | null;
}

export class WorkspaceContentMetricsResult extends ValueObject<WorkspaceContentMetricsResultPrimitives> {
  private constructor(
    private readonly countsVo: WorkspaceContentMetrics,
    private readonly windowDaysVo: ContentMetricsWindowDays
  ) {
    super();
  }

  static fromPrimitives(
    primitives: WorkspaceContentMetricsResultPrimitives
  ): WorkspaceContentMetricsResult {
    return new WorkspaceContentMetricsResult(
      WorkspaceContentMetrics.fromPrimitives(primitives.counts),
      ContentMetricsWindowDays.fromPrimitives(primitives.windowDays)
    );
  }

  toPrimitives(): WorkspaceContentMetricsResultPrimitives {
    return {
      counts: this.countsVo.toPrimitives(),
      windowDays: this.windowDaysVo.toPrimitives(),
    };
  }

  get counts(): WorkspaceContentMetrics {
    return this.countsVo;
  }

  get windowDays(): number | null {
    return this.windowDaysVo.toPrimitives();
  }
}
