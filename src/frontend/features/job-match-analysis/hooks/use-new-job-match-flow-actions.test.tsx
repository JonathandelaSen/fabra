import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { JobMatchAnalysisDetailResponse } from "../types";
import type { useJobMatchAnalysisMutations } from "./use-job-match-analysis-mutations";
import { useNewJobMatchFlowActions } from "./use-new-job-match-flow-actions";

const createdAnalysis = {
  id: "analysis-1",
} as JobMatchAnalysisDetailResponse;

const input = {
  cvId: "cv-1",
  title: "Frontend Engineer",
  jobDescription: "Build accessible product interfaces.",
  jobUrl: "https://example.com/jobs/1",
  model: "mock-model",
  provider: "mock" as const,
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("useNewJobMatchFlowActions", () => {
  it("opens AI analysis while scoring and does not force navigation when scoring finishes", async () => {
    const scoring = createDeferred<JobMatchAnalysisDetailResponse>();
    const replaceAnalysis = vi.fn();
    const goToAnalysisById = vi.fn();
    const mutations = {
      createAnalysis: {
        mutateAsync: vi.fn().mockResolvedValue(createdAnalysis),
      },
      scoreAnalysis: {
        mutateAsync: vi.fn().mockReturnValue(scoring.promise),
      },
    } as unknown as ReturnType<typeof useJobMatchAnalysisMutations>;
    const { result } = renderHook(() =>
      useNewJobMatchFlowActions({
        mutations,
        aiApiKey: "",
        replaceAnalysis,
        goToAnalysisById,
      }),
    );

    let run!: Promise<void>;
    act(() => {
      run = result.current.runNewIntegratedAnalysis(input);
    });

    await waitFor(() => {
      expect(goToAnalysisById).toHaveBeenCalledWith("analysis-1", "summary");
    });
    expect(replaceAnalysis).not.toHaveBeenCalled();

    await act(async () => {
      scoring.resolve(createdAnalysis);
      await run;
    });

    expect(goToAnalysisById).toHaveBeenCalledOnce();
  });
});
