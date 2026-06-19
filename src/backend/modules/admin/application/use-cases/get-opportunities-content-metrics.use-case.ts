import type { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import { OpportunitiesContentMetricsResult } from "../../domain/value-objects/opportunities-content-metrics-result.value-object";

export interface GetOpportunitiesContentMetricsInput {
  days: number | null;
}

export class GetOpportunitiesContentMetricsUseCase {
  constructor(
    private readonly deps: {
      contentMetricsRepo: ContentMetricsRepository;
    }
  ) {}

  async execute(input: GetOpportunitiesContentMetricsInput): Promise<OpportunitiesContentMetricsResult> {
    const since =
      input.days === null
        ? null
        : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

    const window = ContentMetricsWindow.fromPrimitives({
      since: since ? since.toISOString() : null,
    });
    const counts = await this.deps.contentMetricsRepo.countOpportunitiesContent(window);
    return OpportunitiesContentMetricsResult.fromPrimitives({
      counts: counts.toPrimitives(),
      windowDays: input.days,
    });
  }
}
