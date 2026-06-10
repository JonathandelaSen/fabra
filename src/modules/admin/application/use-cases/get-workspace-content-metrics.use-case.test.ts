import { describe, expect, it } from "vitest";
import { GetWorkspaceContentMetricsUseCase } from "./get-workspace-content-metrics.use-case";
import { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import { WorkspaceContentMetrics } from "../../domain/value-objects/workspace-content-metrics.value-object";

class FakeContentMetricsRepository implements ContentMetricsRepository {
  async countCVContent() { return null as any; }
  async countAnalysisContent() { return null as any; }
  async countOpportunitiesContent() { return null as any; }
  async countFeedbackContent() { return null as any; }
  async countWorkspaceContent(window: ContentMetricsWindow): Promise<WorkspaceContentMetrics> {
    if (window.since === null) {
      return WorkspaceContentMetrics.fromPrimitives({ workJournalEntries: 10, commitments: 5, activityContexts: 15 });
    }
    return WorkspaceContentMetrics.fromPrimitives({ workJournalEntries: 2, commitments: 1, activityContexts: 3 });
  }
}

describe("GetWorkspaceContentMetricsUseCase", () => {
  it("returns total counts when days is null", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetWorkspaceContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: null });
    expect(result.windowDays).toBeNull();
    expect(result.counts.workJournalEntries).toBe(10);
  });

  it("calculates since correctly when days is provided", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetWorkspaceContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: 30 });
    expect(result.windowDays).toBe(30);
    expect(result.counts.workJournalEntries).toBe(2);
  });
});
