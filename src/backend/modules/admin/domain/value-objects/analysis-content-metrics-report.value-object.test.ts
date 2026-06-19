import { describe, expect, it } from "vitest";
import { AnalysisContentMetricsReport } from "./analysis-content-metrics-report.value-object";
import { AnalysisContentMetrics } from "./analysis-content-metrics.value-object";

const counts = {
  jobMatchAnalyses: 10,
  analysisChatConversations: 5,
  analysisChatMessages: 20,
  interviewQuestions: 15,
};

describe("AnalysisContentMetricsReport", () => {
  it("builds from primitives and round-trips", () => {
    const report = AnalysisContentMetricsReport.fromPrimitives({
      counts,
      windowDays: 30,
    });

    expect(report.windowDays).toBe(30);
    expect(report.counts.jobMatchAnalyses).toBe(10);
    expect(report.toPrimitives()).toEqual({ counts, windowDays: 30 });
  });

  it("builds from an AnalysisContentMetrics VO with a null window", () => {
    const report = AnalysisContentMetricsReport.create(
      AnalysisContentMetrics.fromPrimitives(counts),
      null
    );

    expect(report.windowDays).toBeNull();
    expect(report.counts.analysisChatMessages).toBe(20);
  });
});
