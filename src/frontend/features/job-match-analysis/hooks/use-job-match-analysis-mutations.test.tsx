import { act, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { renderHookWithProviders } from "@/testing/render";
import { server } from "@/testing/msw/server";
import { useJobMatchAnalysisMutations } from "./use-job-match-analysis-mutations";

const LIST_KEY = ["job-match-analyses", "list"] as const;
const DETAIL_KEY = (id: string) =>
  ["job-match-analyses", "detail", id] as const;
const ANALYSIS_ID = "job-1";

function detail(overrides: Record<string, unknown> = {}) {
  return {
    id: ANALYSIS_ID,
    cvId: "cv-1",
    title: "Platform engineer",
    filename: "cv.pdf",
    createdAt: "2026-06-07T10:00:00.000Z",
    aiScore: null,
    aiAnalyzedAt: null,
    jobUrl: null,
    offerStatus: "interesting",
    offerNextActionAt: null,
    ...overrides,
  };
}

describe("useJobMatchAnalysisMutations", () => {
  it("creates detail cache and prepends a deduplicated list summary", async () => {
    const created = detail({ title: "Staff platform engineer" });
    server.use(
      http.post("http://localhost/api/job-match-analyses", () =>
        HttpResponse.json(created),
      ),
    );
    const { queryClient, result } = renderHookWithProviders(() =>
      useJobMatchAnalysisMutations(),
    );
    queryClient.setQueryData(LIST_KEY, [
      detail({ title: "Stale duplicate" }),
      detail({ id: "job-2", title: "Other role" }),
    ]);

    await act(async () => {
      await result.current.createAnalysis.mutateAsync({
        cvId: "cv-1",
        title: "Staff platform engineer",
        jobDescription: "Role description",
        jobUrl: null,
        model: "mock",
      });
    });

    expect(queryClient.getQueryData(DETAIL_KEY(ANALYSIS_ID))).toEqual(created);
    expect(queryClient.getQueryData(LIST_KEY)).toEqual([
      created,
      detail({ id: "job-2", title: "Other role" }),
    ]);
  });

  it("moves a kanban card optimistically and reconciles the server detail", async () => {
    let releaseRequest: (() => void) | undefined;
    const serverDetail = detail({
      offerStatus: "interview",
      offerNextActionAt: "2026-06-10",
    });
    server.use(
      http.patch(`http://localhost/api/job-match-analyses/${ANALYSIS_ID}`, async () => {
        await new Promise<void>((resolve) => {
          releaseRequest = resolve;
        });
        return HttpResponse.json(serverDetail);
      }),
    );
    const { queryClient, result } = renderHookWithProviders(() =>
      useJobMatchAnalysisMutations(),
    );
    queryClient.setQueryData(LIST_KEY, [detail()]);
    queryClient.setQueryData(DETAIL_KEY(ANALYSIS_ID), detail());

    let movement: Promise<unknown>;
    act(() => {
      movement = result.current.moveAnalysisCard.mutateAsync({
        id: ANALYSIS_ID,
        status: "interview",
      });
    });

    await waitFor(() => {
      expect(
        (queryClient.getQueryData(LIST_KEY) as Array<{ offerStatus: string }>)[0]
          ?.offerStatus,
      ).toBe("interview");
    });
    expect(
      (queryClient.getQueryData(DETAIL_KEY(ANALYSIS_ID)) as {
        offerStatus: string;
      }).offerStatus,
    ).toBe("interview");

    await act(async () => {
      releaseRequest?.();
      await movement;
    });

    expect(queryClient.getQueryData(DETAIL_KEY(ANALYSIS_ID))).toEqual(serverDetail);
    expect(queryClient.getQueryData(LIST_KEY)).toEqual([serverDetail]);
  });

  it("rolls back an optimistic card move when the server rejects it", async () => {
    server.use(
      http.patch(`http://localhost/api/job-match-analyses/${ANALYSIS_ID}`, () =>
        HttpResponse.json({ error: "Move failed" }, { status: 500 }),
      ),
    );
    const previousDetail = detail();
    const previousList = [previousDetail];
    const { queryClient, result } = renderHookWithProviders(() =>
      useJobMatchAnalysisMutations(),
    );
    queryClient.setQueryData(LIST_KEY, previousList);
    queryClient.setQueryData(DETAIL_KEY(ANALYSIS_ID), previousDetail);

    await act(async () => {
      await expect(
        result.current.moveAnalysisCard.mutateAsync({
          id: ANALYSIS_ID,
          status: "interview",
        }),
      ).rejects.toThrow("Move failed");
    });

    expect(queryClient.getQueryData(LIST_KEY)).toEqual(previousList);
    expect(queryClient.getQueryData(DETAIL_KEY(ANALYSIS_ID))).toEqual(
      previousDetail,
    );
  });

  it("rolls back list and detail when optimistic deletion fails", async () => {
    server.use(
      http.delete(`http://localhost/api/job-match-analyses/${ANALYSIS_ID}`, () =>
        HttpResponse.json({ error: "Delete failed" }, { status: 500 }),
      ),
    );
    const previousDetail = detail();
    const previousList = [
      previousDetail,
      detail({ id: "job-2", title: "Other role" }),
    ];
    const { queryClient, result } = renderHookWithProviders(() =>
      useJobMatchAnalysisMutations(),
    );
    queryClient.setQueryData(LIST_KEY, previousList);
    queryClient.setQueryData(DETAIL_KEY(ANALYSIS_ID), previousDetail);

    await act(async () => {
      await expect(
        result.current.deleteAnalysis.mutateAsync(ANALYSIS_ID),
      ).rejects.toThrow("Delete failed");
    });

    expect(queryClient.getQueryData(LIST_KEY)).toEqual(previousList);
    expect(queryClient.getQueryData(DETAIL_KEY(ANALYSIS_ID))).toEqual(
      previousDetail,
    );
  });
});
