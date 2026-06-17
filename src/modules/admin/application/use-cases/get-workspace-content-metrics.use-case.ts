import type { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import { WorkspaceContentMetricsResult } from "../../domain/value-objects/workspace-content-metrics-result.value-object";

export interface GetWorkspaceContentMetricsInput {
  days: number | null;
}

export class GetWorkspaceContentMetricsUseCase {
  constructor(
    private readonly deps: {
      contentMetricsRepo: ContentMetricsRepository;
    }
  ) {}

  async execute(input: GetWorkspaceContentMetricsInput): Promise<WorkspaceContentMetricsResult> {
    const since =
      input.days === null
        ? null
        : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

    const window = ContentMetricsWindow.fromPrimitives({
      since: since ? since.toISOString() : null,
    });
    const counts = await this.deps.contentMetricsRepo.countWorkspaceContent(window);
    return WorkspaceContentMetricsResult.fromPrimitives({
      counts: counts.toPrimitives(),
      windowDays: input.days,
    });
  }
}
