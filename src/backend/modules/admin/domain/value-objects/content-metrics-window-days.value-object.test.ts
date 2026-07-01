import { describe, expect, it } from "vitest";
import { ContentMetricsWindowDays, InvalidContentMetricsWindowDaysError } from "./content-metrics-window-days.value-object";

describe("ContentMetricsWindowDays", () => {
  it("creates from primitives and converts back", () => {
    const vo = ContentMetricsWindowDays.fromPrimitives(30);
    expect(vo.toPrimitives()).toBe(30);

    const nullVo = ContentMetricsWindowDays.fromPrimitives(null);
    expect(nullVo.toPrimitives()).toBeNull();
  });

  it("throws error for negative values", () => {
    expect(() => ContentMetricsWindowDays.fromPrimitives(-1)).toThrow(InvalidContentMetricsWindowDaysError);
  });
});
