import { act, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { renderHookWithProviders } from "@/testing/render";
import { server } from "@/testing/msw/server";
import { useCVLibraryMutations } from "./use-cv-library-mutations";

const LIST_KEY = ["cv-library", "list", "all"] as const;
const DETAIL_KEY = (id: string) => ["cv-library", "detail", id] as const;
const CV_ID = "cv-1";

function cv(overrides: Record<string, unknown> = {}) {
  return {
    id: CV_ID,
    name: "Platform CV",
    filename: "platform.pdf",
    type: "uploaded",
    createdAt: "2026-06-07T10:00:00.000Z",
    updatedAt: "2026-06-07T10:00:00.000Z",
    ...overrides,
  };
}

describe("useCVLibraryMutations", () => {
  it("uploads a CV, prepends it without duplicates, and seeds detail cache", async () => {
    const uploaded = cv({ name: "Updated platform CV" });
    server.use(
      http.post("http://localhost/api/cvs", () => HttpResponse.json(uploaded)),
    );
    const { queryClient, result } = renderHookWithProviders(() =>
      useCVLibraryMutations(),
    );
    queryClient.setQueryData(LIST_KEY, [
      cv({ name: "Stale duplicate" }),
      cv({ id: "cv-2", name: "Other CV" }),
    ]);

    await act(async () => {
      await result.current.uploadCV.mutateAsync(new FormData());
    });

    expect(queryClient.getQueryData(LIST_KEY)).toEqual([
      uploaded,
      cv({ id: "cv-2", name: "Other CV" }),
    ]);
    expect(queryClient.getQueryData(DETAIL_KEY(CV_ID))).toEqual(uploaded);
  });

  it("renames list and detail optimistically, then reconciles the server result", async () => {
    let releaseRequest: (() => void) | undefined;
    const serverResult = cv({
      name: "Server-confirmed CV",
      updatedAt: "2026-06-07T12:00:00.000Z",
    });
    server.use(
      http.patch(`http://localhost/api/cvs/${CV_ID}`, async () => {
        await new Promise<void>((resolve) => {
          releaseRequest = resolve;
        });
        return HttpResponse.json(serverResult);
      }),
    );
    const { queryClient, result } = renderHookWithProviders(() =>
      useCVLibraryMutations(),
    );
    queryClient.setQueryData(LIST_KEY, [cv()]);
    queryClient.setQueryData(DETAIL_KEY(CV_ID), cv());

    let rename: Promise<unknown>;
    act(() => {
      rename = result.current.renameCV.mutateAsync({
        id: CV_ID,
        name: "Optimistic CV",
      });
    });

    await waitFor(() => {
      expect(
        (queryClient.getQueryData(LIST_KEY) as Array<{ name: string }>)[0]?.name,
      ).toBe("Optimistic CV");
    });
    expect(
      (queryClient.getQueryData(DETAIL_KEY(CV_ID)) as { name: string }).name,
    ).toBe("Optimistic CV");

    await act(async () => {
      releaseRequest?.();
      await rename;
    });

    expect(queryClient.getQueryData(LIST_KEY)).toEqual([serverResult]);
    expect(queryClient.getQueryData(DETAIL_KEY(CV_ID))).toEqual(serverResult);
  });

  it("restores the list when optimistic rename fails", async () => {
    server.use(
      http.patch(`http://localhost/api/cvs/${CV_ID}`, () =>
        HttpResponse.json({ error: "Rename failed" }, { status: 500 }),
      ),
    );
    const previousList = [cv(), cv({ id: "cv-2", name: "Other CV" })];
    const { queryClient, result } = renderHookWithProviders(() =>
      useCVLibraryMutations(),
    );
    queryClient.setQueryData(LIST_KEY, previousList);

    await act(async () => {
      await expect(
        result.current.renameCV.mutateAsync({
          id: CV_ID,
          name: "Optimistic CV",
        }),
      ).rejects.toThrow("Rename failed");
    });

    expect(queryClient.getQueryData(LIST_KEY)).toEqual(previousList);
  });

  it("restores the list when optimistic deletion fails", async () => {
    server.use(
      http.delete(`http://localhost/api/cvs/${CV_ID}`, () =>
        HttpResponse.json({ error: "Delete failed" }, { status: 500 }),
      ),
    );
    const previousList = [cv(), cv({ id: "cv-2", name: "Other CV" })];
    const { queryClient, result } = renderHookWithProviders(() =>
      useCVLibraryMutations(),
    );
    queryClient.setQueryData(LIST_KEY, previousList);
    queryClient.setQueryData(DETAIL_KEY(CV_ID), cv());

    await act(async () => {
      await expect(result.current.deleteCV.mutateAsync(CV_ID)).rejects.toThrow(
        "Delete failed",
      );
    });

    expect(queryClient.getQueryData(LIST_KEY)).toEqual(previousList);
  });
});
