import { describe, expect, it } from "vitest";
import { FeedbackContentMetrics } from "./feedback-content-metrics.value-object";

describe("FeedbackContentMetrics", () => {
  it("creates from primitives and converts back", () => {
    const vo = FeedbackContentMetrics.fromPrimitives({
      feedbackNotesFeedbacks: 12,
      receivedFeedback: 4,
    });
    expect(vo.toPrimitives()).toEqual({
      feedbackNotesFeedbacks: 12,
      receivedFeedback: 4,
    });
    expect(vo.feedbackNotesFeedbacks).toBe(12);
    expect(vo.receivedFeedback).toBe(4);
  });
});
