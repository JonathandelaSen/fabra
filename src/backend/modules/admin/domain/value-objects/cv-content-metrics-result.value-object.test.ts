import { describe, expect, it } from "vitest";
import { CVContentMetricsResult } from "./cv-content-metrics-result.value-object";

describe("CVContentMetricsResult", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      counts: { cvs: 10, cvStructuredProfiles: 5 },
      windowDays: 30,
    };
    const vo = CVContentMetricsResult.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
    expect(vo.counts.cvs).toBe(10);
    expect(vo.counts.cvStructuredProfiles).toBe(5);
    expect(vo.windowDays).toBe(30);
  });
});
