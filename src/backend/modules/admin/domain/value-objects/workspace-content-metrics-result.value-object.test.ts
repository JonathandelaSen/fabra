import { describe, expect, it } from "vitest";
import { WorkspaceContentMetricsResult } from "./workspace-content-metrics-result.value-object";

describe("WorkspaceContentMetricsResult", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      counts: { workJournalEntries: 100, commitments: 50, activityContexts: 10 },
      windowDays: 14,
    };
    const vo = WorkspaceContentMetricsResult.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
    expect(vo.counts.workJournalEntries).toBe(100);
    expect(vo.counts.commitments).toBe(50);
    expect(vo.counts.activityContexts).toBe(10);
    expect(vo.windowDays).toBe(14);
  });
});
