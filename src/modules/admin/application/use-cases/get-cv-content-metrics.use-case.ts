import type { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import { CVContentMetricsResult } from "../../domain/value-objects/cv-content-metrics-result.value-object";

export interface GetCVContentMetricsInput {
  days: number | null;
}

export class GetCVContentMetricsUseCase {
  constructor(
    private readonly deps: {
      contentMetricsRepo: ContentMetricsRepository;
    }
  ) {}

  async execute(input: GetCVContentMetricsInput): Promise<CVContentMetricsResult> {
    const since =
      input.days === null
        ? null
        : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

    const window = ContentMetricsWindow.fromPrimitives({
      since: since ? since.toISOString() : null,
    });
    const counts = await this.deps.contentMetricsRepo.countCVContent(window);
    return CVContentMetricsResult.fromPrimitives({
      counts: counts.toPrimitives(),
      windowDays: input.days,
    });
  }
}
