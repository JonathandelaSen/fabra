import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useImmediateAnalysisSelection } from "./use-immediate-analysis-selection";

describe("useImmediateAnalysisSelection", () => {
  it("selects immediately and yields back to the route after navigation resolves", () => {
    const { result, rerender } = renderHook(
      ({ routeId }) => useImmediateAnalysisSelection(routeId),
      { initialProps: { routeId: "analysis-1" } },
    );

    act(() => result.current.selectImmediately("analysis-2"));
    expect(result.current.selectedAnalysisId).toBe("analysis-2");

    rerender({ routeId: "analysis-2" });
    expect(result.current.selectedAnalysisId).toBe("analysis-2");
  });
});
