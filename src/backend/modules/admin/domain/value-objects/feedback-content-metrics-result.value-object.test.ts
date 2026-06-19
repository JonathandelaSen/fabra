import { describe, expect, it } from "vitest";
import { FeedbackContentMetricsResult } from "./feedback-content-metrics-result.value-object";

describe("FeedbackContentMetricsResult", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      counts: { feedbackNotesFeedbacks: 15, receivedFeedback: 22 },
      windowDays: 7,
    };
    const vo = FeedbackContentMetricsResult.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
    expect(vo.counts.feedbackNotesFeedbacks).toBe(15);
    expect(vo.counts.receivedFeedback).toBe(22);
    expect(vo.windowDays).toBe(7);
  });
});
