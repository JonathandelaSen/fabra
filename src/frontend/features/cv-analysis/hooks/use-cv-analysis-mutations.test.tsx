import { act, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { renderHookWithProviders } from "@/testing/render";
import { server } from "@/testing/msw/server";
import {
  useCreateCVAnalysis,
  useDeleteCVAnalysis,
  useScoreCVAnalysis,
} from "./use-cv-analysis-mutations";

const LIST_QUERY_KEY = ["cv-analysis", "list", "general"] as const;
const DETAIL_QUERY_KEY = (id: string) =>
  ["cv-analysis", "detail", id] as const;
const ANALYSIS_ID = "analysis-1";

function analysis(overrides: Record<string, unknown> = {}) {
  return {
    id: ANALYSIS_ID,
    title: "CV analysis",
    filename: "cv.pdf",
    createdAt: "2026-06-07T10:00:00.000Z",
    aiScore: null,
    ...overrides,
  };
}

describe("useCreateCVAnalysis", () => {
  it("prepends the created analysis without duplicating it and seeds detail cache", async () => {
    const createdAnalysis = analysis({ title: "Updated analysis" });
    server.use(
      http.post("http://localhost/api/cv-analyses", () =>
        HttpResponse.json(createdAnalysis),
      ),
    );
    const { queryClient, result } = renderHookWithProviders(() =>
      useCreateCVAnalysis(),
    );
    queryClient.setQueryData(LIST_QUERY_KEY, [
      analysis({ title: "Stale duplicate" }),
      analysis({ id: "analysis-2", title: "Existing analysis" }),
    ]);

    await act(async () => {
      await result.current.mutateAsync({
        cvId: "cv-1",
        title: "Updated analysis",
      });
    });

    expect(queryClient.getQueryData(LIST_QUERY_KEY)).toEqual([
      createdAnalysis,
      analysis({ id: "analysis-2", title: "Existing analysis" }),
    ]);
    expect(queryClient.getQueryData(DETAIL_QUERY_KEY(ANALYSIS_ID))).toEqual(
      createdAnalysis,
    );
  });
});

describe("useScoreCVAnalysis", () => {
  it("reconciles scored analysis data into detail and list caches", async () => {
    const scoredAnalysis = analysis({
      aiScore: 88,
      aiAnalyzedAt: "2026-06-07T11:00:00.000Z",
    });
    server.use(
      http.post(`http://localhost/api/cv-analyses/${ANALYSIS_ID}/score`, () =>
        HttpResponse.json(scoredAnalysis),
      ),
    );
    const { queryClient, result } = renderHookWithProviders(() =>
      useScoreCVAnalysis(),
    );
    queryClient.setQueryData(LIST_QUERY_KEY, [
      analysis(),
      analysis({ id: "analysis-2", title: "Other analysis" }),
    ]);

    await act(async () => {
      await result.current.mutateAsync({
        id: ANALYSIS_ID,
        input: {
          provider: "mock",
          apiKey: "",
          model: "mock",
          additionalContext: null,
        },
      });
    });

    expect(queryClient.getQueryData(DETAIL_QUERY_KEY(ANALYSIS_ID))).toEqual(
      scoredAnalysis,
    );
    expect(queryClient.getQueryData(LIST_QUERY_KEY)).toEqual([
      scoredAnalysis,
      analysis({ id: "analysis-2", title: "Other analysis" }),
    ]);
  });
});

describe("useDeleteCVAnalysis", () => {
  it("removes list and detail cache optimistically", async () => {
    let releaseRequest: (() => void) | undefined;
    server.use(
      http.delete(
        `http://localhost/api/cv-analyses/${ANALYSIS_ID}`,
        async () => {
          await new Promise<void>((resolve) => {
            releaseRequest = resolve;
          });
          return HttpResponse.json({ ok: true });
        },
      ),
    );
    const { queryClient, result } = renderHookWithProviders(() =>
      useDeleteCVAnalysis(),
    );
    queryClient.setQueryData(LIST_QUERY_KEY, [
      analysis(),
      analysis({ id: "analysis-2", title: "Other analysis" }),
    ]);
    queryClient.setQueryData(DETAIL_QUERY_KEY(ANALYSIS_ID), analysis());

    let deletion: Promise<unknown>;
    act(() => {
      deletion = result.current.mutateAsync(ANALYSIS_ID);
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(LIST_QUERY_KEY)).toEqual([
        analysis({ id: "analysis-2", title: "Other analysis" }),
      ]);
    });
    expect(queryClient.getQueryData(DETAIL_QUERY_KEY(ANALYSIS_ID))).toBeUndefined();

    await act(async () => {
      releaseRequest?.();
      await deletion;
    });
  });

  it("restores list and detail cache when deletion fails", async () => {
    server.use(
      http.delete(`http://localhost/api/cv-analyses/${ANALYSIS_ID}`, () =>
        HttpResponse.json({ error: "Delete failed" }, { status: 500 }),
      ),
    );
    const cachedAnalysis = analysis();
    const cachedList = [
      cachedAnalysis,
      analysis({ id: "analysis-2", title: "Other analysis" }),
    ];
    const { queryClient, result } = renderHookWithProviders(() =>
      useDeleteCVAnalysis(),
    );
    queryClient.setQueryData(LIST_QUERY_KEY, cachedList);
    queryClient.setQueryData(DETAIL_QUERY_KEY(ANALYSIS_ID), cachedAnalysis);

    await act(async () => {
      await expect(result.current.mutateAsync(ANALYSIS_ID)).rejects.toThrow(
        "Delete failed",
      );
    });

    expect(queryClient.getQueryData(LIST_QUERY_KEY)).toEqual(cachedList);
    expect(queryClient.getQueryData(DETAIL_QUERY_KEY(ANALYSIS_ID))).toEqual(
      cachedAnalysis,
    );
  });
});
