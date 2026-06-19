import { act, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { useCreateActivityContext } from "./use-activity-contexts";
import { renderHookWithProviders } from "@/testing/render";
import { server } from "@/testing/msw/server";

const activityContextListQueryKey = ["activity-contexts", "list"] as const;

describe("useCreateActivityContext", () => {
  it("creates a context and invalidates activity context consumers", async () => {
    server.use(
      http.post("http://localhost/api/activity-contexts", async ({ request }) => {
        const input = (await request.json()) as { name: string; type: string };

        return HttpResponse.json({
          id: "ctx-1",
          userId: "user-1",
          type: input.type,
          name: input.name,
          status: "active",
          isDefault: false,
          roleOrLabel: null,
          createdFromCv: false,
          createdAt: "2026-06-06T10:00:00.000Z",
          updatedAt: "2026-06-06T10:00:00.000Z",
        });
      }),
    );

    const { queryClient, result } = renderHookWithProviders(() =>
      useCreateActivityContext(),
    );
    queryClient.setQueryData(activityContextListQueryKey, {
      contexts: [],
      suggestions: [],
    });

    let created: unknown;
    await act(async () => {
      created = await result.current.create({
        name: "Hiring platform",
        type: "project",
      });
    });

    expect(created).toMatchObject({
      id: "ctx-1",
      name: "Hiring platform",
      type: "project",
    });
    await waitFor(() => {
      expect(queryClient.getQueryState(activityContextListQueryKey)?.isInvalidated).toBe(
        true,
      );
    });
  });

  it("stores the API error and returns null when creation fails", async () => {
    server.use(
      http.post("http://localhost/api/activity-contexts", () =>
        HttpResponse.json(
          { error: "Could not create activity context." },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHookWithProviders(() => useCreateActivityContext());

    let created: unknown;
    await act(async () => {
      created = await result.current.create({
        name: "Hiring platform",
        type: "project",
      });
    });

    expect(created).toBeNull();
    await waitFor(() => {
      expect(result.current.error).toBe("Could not create activity context.");
    });
  });
});
