import type { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import type { CVContentMetrics } from "../../domain/value-objects/cv-content-metrics.value-object";

export interface GetCVContentMetricsInput {
  days: number | null;
}

export interface GetCVContentMetricsResult {
  counts: CVContentMetrics;
  windowDays: number | null;
}

export class GetCVContentMetricsUseCase {
  constructor(
    private readonly deps: {
      contentMetricsRepo: ContentMetricsRepository;
    }
  ) {}

  async execute(input: GetCVContentMetricsInput): Promise<GetCVContentMetricsResult> {
    const since =
      input.days === null
        ? null
        : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

    const window = ContentMetricsWindow.fromPrimitives({
      since: since ? since.toISOString() : null,
    });
    const counts = await this.deps.contentMetricsRepo.countCVContent(window);
    return { counts, windowDays: input.days };
  }
}
