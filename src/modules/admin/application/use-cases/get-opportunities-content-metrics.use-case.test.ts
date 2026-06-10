import { describe, expect, it } from "vitest";
import { GetOpportunitiesContentMetricsUseCase } from "./get-opportunities-content-metrics.use-case";
import { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import { OpportunitiesContentMetrics } from "../../domain/value-objects/opportunities-content-metrics.value-object";

class FakeContentMetricsRepository implements ContentMetricsRepository {
  async countCVContent() { return null as any; }
  async countAnalysisContent() { return null as any; }
  async countOpportunitiesContent(window: ContentMetricsWindow): Promise<OpportunitiesContentMetrics> {
    if (window.since === null) {
      return OpportunitiesContentMetrics.fromPrimitives({ jobOpportunities: 10, processQuestions: 5 });
    }
    return OpportunitiesContentMetrics.fromPrimitives({ jobOpportunities: 2, processQuestions: 1 });
  }
  async countFeedbackContent() { return null as any; }
  async countWorkspaceContent() { return null as any; }
}

describe("GetOpportunitiesContentMetricsUseCase", () => {
  it("returns total counts when days is null", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetOpportunitiesContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: null });
    expect(result.windowDays).toBeNull();
    expect(result.counts.jobOpportunities).toBe(10);
  });

  it("calculates since correctly when days is provided", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetOpportunitiesContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: 30 });
    expect(result.windowDays).toBe(30);
    expect(result.counts.jobOpportunities).toBe(2);
  });
});
