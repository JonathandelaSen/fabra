import { describe, expect, it } from "vitest";
import { CVContentMetrics } from "./cv-content-metrics.value-object";

describe("CVContentMetrics", () => {
  it("creates from primitives and converts back", () => {
    const vo = CVContentMetrics.fromPrimitives({ cvs: 10, cvStructuredProfiles: 5 });
    expect(vo.toPrimitives()).toEqual({ cvs: 10, cvStructuredProfiles: 5 });
    expect(vo.cvs).toBe(10);
    expect(vo.cvStructuredProfiles).toBe(5);
  });
});
