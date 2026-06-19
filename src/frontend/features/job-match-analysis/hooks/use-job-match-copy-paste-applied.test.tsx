import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/testing/render";
import { useJobMatchCopyPasteApplied } from "./use-job-match-copy-paste-applied";

const LIST_KEY = ["job-match-analyses", "list"] as const;
const DETAIL_KEY = ["job-match-analyses", "detail", "job-1"] as const;

describe("useJobMatchCopyPasteApplied", () => {
  it("updates detail and score fields in the list before notifying the consumer", () => {
    const onApplied = vi.fn();
    const updated = {
      id: "job-1",
      title: "Platform engineer",
      aiScore: 91,
      aiAnalyzedAt: "2026-06-07T12:00:00.000Z",
    };
    const { queryClient, result } = renderHookWithProviders(() =>
      useJobMatchCopyPasteApplied(onApplied),
    );
    queryClient.setQueryData(LIST_KEY, [
      { id: "job-1", title: "Platform engineer", aiScore: null },
      { id: "job-2", title: "Other role", aiScore: 75 },
    ]);

    act(() => {
      result.current(updated as never);
    });

    expect(queryClient.getQueryData(DETAIL_KEY)).toEqual(updated);
    expect(queryClient.getQueryData(LIST_KEY)).toEqual([
      {
        id: "job-1",
        title: "Platform engineer",
        aiScore: 91,
        aiAnalyzedAt: "2026-06-07T12:00:00.000Z",
      },
      { id: "job-2", title: "Other role", aiScore: 75 },
    ]);
    expect(onApplied).toHaveBeenCalledOnce();
  });
});
