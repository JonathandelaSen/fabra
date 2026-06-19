import { describe, expect, it } from "vitest";
import { ContentMetricsWindow } from "./content-metrics-window.value-object";

describe("ContentMetricsWindow", () => {
  it("creates from primitives and converts back", () => {
    const dateStr = "2026-06-10T12:00:00.000Z";
    const window = ContentMetricsWindow.fromPrimitives({ since: dateStr });
    expect(window.toPrimitives().since).toBe(dateStr);
    expect(window.since).toBeInstanceOf(Date);
    expect(window.since?.toISOString()).toBe(dateStr);
  });

  it("handles null since date", () => {
    const window = ContentMetricsWindow.fromPrimitives({ since: null });
    expect(window.toPrimitives().since).toBeNull();
    expect(window.since).toBeNull();
  });
});
