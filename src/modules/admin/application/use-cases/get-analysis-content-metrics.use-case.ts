import type { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import type { AnalysisContentMetrics } from "../../domain/value-objects/analysis-content-metrics.value-object";

export interface GetAnalysisContentMetricsInput {
  days: number | null;
}

export interface GetAnalysisContentMetricsResult {
  counts: AnalysisContentMetrics;
  windowDays: number | null;
}

export class GetAnalysisContentMetricsUseCase {
  constructor(
    private readonly deps: {
      contentMetricsRepo: ContentMetricsRepository;
    }
  ) {}

  async execute(input: GetAnalysisContentMetricsInput): Promise<GetAnalysisContentMetricsResult> {
    const since =
      input.days === null
        ? null
        : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

    const window = ContentMetricsWindow.fromPrimitives({
      since: since ? since.toISOString() : null,
    });
    const counts = await this.deps.contentMetricsRepo.countAnalysisContent(window);
    return { counts, windowDays: input.days };
  }
}
