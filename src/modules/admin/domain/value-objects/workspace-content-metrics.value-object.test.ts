import { describe, expect, it } from "vitest";
import { WorkspaceContentMetrics } from "./workspace-content-metrics.value-object";

describe("WorkspaceContentMetrics", () => {
  it("creates from primitives and converts back", () => {
    const vo = WorkspaceContentMetrics.fromPrimitives({
      workJournalEntries: 15,
      commitments: 3,
      activityContexts: 6,
    });
    expect(vo.toPrimitives()).toEqual({
      workJournalEntries: 15,
      commitments: 3,
      activityContexts: 6,
    });
    expect(vo.workJournalEntries).toBe(15);
    expect(vo.commitments).toBe(3);
    expect(vo.activityContexts).toBe(6);
  });
});
