import { describe, expect, it } from "vitest";
import { AnalysisContentMetrics } from "./analysis-content-metrics.value-object";

describe("AnalysisContentMetrics", () => {
  it("creates from primitives and converts back", () => {
    const vo = AnalysisContentMetrics.fromPrimitives({
      jobMatchAnalyses: 1,
      analysisChatConversations: 2,
      analysisChatMessages: 3,
      interviewQuestions: 4,
    });
    expect(vo.toPrimitives()).toEqual({
      jobMatchAnalyses: 1,
      analysisChatConversations: 2,
      analysisChatMessages: 3,
      interviewQuestions: 4,
    });
    expect(vo.jobMatchAnalyses).toBe(1);
    expect(vo.analysisChatConversations).toBe(2);
    expect(vo.analysisChatMessages).toBe(3);
    expect(vo.interviewQuestions).toBe(4);
  });
});
