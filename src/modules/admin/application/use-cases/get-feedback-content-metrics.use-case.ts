import type { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import type { FeedbackContentMetrics } from "../../domain/value-objects/feedback-content-metrics.value-object";

export interface GetFeedbackContentMetricsInput {
  days: number | null;
}

export interface GetFeedbackContentMetricsResult {
  counts: FeedbackContentMetrics;
  windowDays: number | null;
}

export class GetFeedbackContentMetricsUseCase {
  constructor(
    private readonly deps: {
      contentMetricsRepo: ContentMetricsRepository;
    }
  ) {}

  async execute(input: GetFeedbackContentMetricsInput): Promise<GetFeedbackContentMetricsResult> {
    const since =
      input.days === null
        ? null
        : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

    const window = ContentMetricsWindow.fromPrimitives({
      since: since ? since.toISOString() : null,
    });
    const counts = await this.deps.contentMetricsRepo.countFeedbackContent(window);
    return { counts, windowDays: input.days };
  }
}
