import { describe, expect, it } from "vitest";
import { OpportunitiesContentMetrics } from "./opportunities-content-metrics.value-object";

describe("OpportunitiesContentMetrics", () => {
  it("creates from primitives and converts back", () => {
    const vo = OpportunitiesContentMetrics.fromPrimitives({
      jobOpportunities: 8,
      processQuestions: 2,
    });
    expect(vo.toPrimitives()).toEqual({
      jobOpportunities: 8,
      processQuestions: 2,
    });
    expect(vo.jobOpportunities).toBe(8);
    expect(vo.processQuestions).toBe(2);
  });
});
