import { describe, expect, it } from "vitest";
import { GetFeedbackContentMetricsUseCase } from "./get-feedback-content-metrics.use-case";
import { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import { FeedbackContentMetrics } from "../../domain/value-objects/feedback-content-metrics.value-object";

class FakeContentMetricsRepository implements ContentMetricsRepository {
  async countCVContent() { return null as any; }
  async countAnalysisContent() { return null as any; }
  async countOpportunitiesContent() { return null as any; }
  async countFeedbackContent(window: ContentMetricsWindow): Promise<FeedbackContentMetrics> {
    if (window.since === null) {
      return FeedbackContentMetrics.fromPrimitives({ feedbackNotesFeedbacks: 10, receivedFeedback: 5 });
    }
    return FeedbackContentMetrics.fromPrimitives({ feedbackNotesFeedbacks: 2, receivedFeedback: 1 });
  }
  async countWorkspaceContent() { return null as any; }
}

describe("GetFeedbackContentMetricsUseCase", () => {
  it("returns total counts when days is null", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetFeedbackContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: null });
    expect(result.windowDays).toBeNull();
    expect(result.counts.feedbackNotesFeedbacks).toBe(10);
  });

  it("calculates since correctly when days is provided", async () => {
    const repo = new FakeContentMetricsRepository();
    const useCase = new GetFeedbackContentMetricsUseCase({ contentMetricsRepo: repo });
    
    const result = await useCase.execute({ days: 30 });
    expect(result.windowDays).toBe(30);
    expect(result.counts.feedbackNotesFeedbacks).toBe(2);
  });
});
