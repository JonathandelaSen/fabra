import { describe, expect, it } from "vitest";
import { GetAnalysisContentMetricsUseCase } from "./get-analysis-content-metrics.use-case";
import { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import { AnalysisContentMetrics } from "../../domain/value-objects/analysis-content-metrics.value-object";

class FakeContentMetricsRepository implements ContentMetricsRepository {
  async countCVContent() { return null as any; }
  async countAnalysisContent(window: ContentMetricsWindow): Promise<AnalysisContentMetrics> {
    if (window.since === null) {
      return AnalysisContentMetrics.fromPrimitives({
        jobMatchAnalyses: 10,
        analysisChatConversations: 5,
        analysisChatMessages: 20,
        interviewQuestions: 15,
      });
    }
    return AnalysisContentMetrics.fromPrimitives({
      jobMatchAnalyses: 2,
      analysisChatConversations: 1,
      analysisChatMessages: 4,
      interviewQuestions: 3,
    });
  }
  async countOpportunitiesContent() { return null as any; }
  async countFeedbackContent() { return null as any; }
  async countWorkspaceContent() { return null as any; }
}

describe("GetAnalysisContentMetricsUseCase", () => {
  it("returns total counts when days is null", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetAnalysisContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: null });
    expect(result.windowDays).toBeNull();
    expect(result.counts.jobMatchAnalyses).toBe(10);
  });

  it("calculates since correctly when days is provided", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetAnalysisContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: 30 });
    expect(result.windowDays).toBe(30);
    expect(result.counts.jobMatchAnalyses).toBe(2);
  });
});
