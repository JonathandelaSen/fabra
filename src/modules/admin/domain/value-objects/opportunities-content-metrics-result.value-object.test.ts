import { describe, expect, it } from "vitest";
import { OpportunitiesContentMetricsResult } from "./opportunities-content-metrics-result.value-object";

describe("OpportunitiesContentMetricsResult", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      counts: { jobOpportunities: 30, processQuestions: 40 },
      windowDays: 90,
    };
    const vo = OpportunitiesContentMetricsResult.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
    expect(vo.counts.jobOpportunities).toBe(30);
    expect(vo.counts.processQuestions).toBe(40);
    expect(vo.windowDays).toBe(90);
  });
});
