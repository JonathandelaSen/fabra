import { describe, expect, it } from "vitest";
import { GetCVContentMetricsUseCase } from "./get-cv-content-metrics.use-case";
import { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import { CVContentMetrics } from "../../domain/value-objects/cv-content-metrics.value-object";

class FakeContentMetricsRepository implements ContentMetricsRepository {
  async countCVContent(window: ContentMetricsWindow): Promise<CVContentMetrics> {
    if (window.since === null) {
      return CVContentMetrics.fromPrimitives({ cvs: 10, cvStructuredProfiles: 5 });
    }
    return CVContentMetrics.fromPrimitives({ cvs: 2, cvStructuredProfiles: 1 });
  }
  async countAnalysisContent() { return null as any; }
  async countOpportunitiesContent() { return null as any; }
  async countFeedbackContent() { return null as any; }
  async countWorkspaceContent() { return null as any; }
}

describe("GetCVContentMetricsUseCase", () => {
  it("returns total counts when days is null", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetCVContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: null });
    expect(result.windowDays).toBeNull();
    expect(result.counts.cvs).toBe(10);
  });

  it("calculates since correctly when days is provided", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetCVContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: 30 });
    expect(result.windowDays).toBe(30);
    expect(result.counts.cvs).toBe(2);
  });
});
