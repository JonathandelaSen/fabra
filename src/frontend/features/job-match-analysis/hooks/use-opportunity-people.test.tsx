import { act, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { renderHookWithProviders } from "@/frontend/testing/render";
import { server } from "@/frontend/testing/msw/server";
import { useOpportunityPeople } from "./use-opportunity-people";

const analysisId = "analysis-1";
const path = `http://localhost/api/job-match-analyses/${analysisId}/people`;
const person = {
  id: "person-1",
  name: "Marta García",
  role: "hiring_manager" as const,
  jobTitle: "Engineering Manager",
  organization: "Acme",
  email: null,
  phone: null,
  links: [],
  notes: null,
  createdAt: "2026-06-30T09:00:00.000Z",
  updatedAt: "2026-06-30T09:00:00.000Z",
};

describe("useOpportunityPeople", () => {
  it("removes a person from the cache before the delete request finishes", async () => {
    let finishDelete: (() => void) | undefined;
    const deletePending = new Promise<void>((resolve) => {
      finishDelete = resolve;
    });
    server.use(
      http.get(path, () => HttpResponse.json([person])),
      http.delete(`${path}/:personId`, async () => {
        await deletePending;
        return HttpResponse.json({ success: true });
      }),
    );
    const { result } = renderHookWithProviders(() =>
      useOpportunityPeople(analysisId),
    );

    await waitFor(() => expect(result.current.query.data).toEqual([person]));

    let deletion: Promise<unknown> | undefined;
    act(() => {
      deletion = result.current.deletePerson.mutateAsync(person.id);
    });

    await waitFor(() => expect(result.current.query.data).toEqual([]));

    finishDelete?.();
    await act(async () => {
      await deletion;
    });
  });

  it("restores an optimistically removed person when deletion fails", async () => {
    let finishDelete: (() => void) | undefined;
    const deletePending = new Promise<void>((resolve) => {
      finishDelete = resolve;
    });
    server.use(
      http.get(path, () => HttpResponse.json([person])),
      http.delete(`${path}/:personId`, async () => {
        await deletePending;
        return HttpResponse.json(
          { error: "Delete failed" },
          { status: 500 },
        );
      }),
    );
    const { result } = renderHookWithProviders(() =>
      useOpportunityPeople(analysisId),
    );

    await waitFor(() => expect(result.current.query.data).toEqual([person]));

    let deletion: Promise<unknown> | undefined;
    act(() => {
      deletion = result.current.deletePerson.mutateAsync(person.id);
    });
    await waitFor(() => expect(result.current.query.data).toEqual([]));

    finishDelete?.();
    await act(async () => {
      await expect(deletion).rejects.toThrow("Delete failed");
    });
    await waitFor(() => expect(result.current.query.data).toEqual([person]));
  });

  it("loads people and reconciles create, update, and delete mutations", async () => {
    let people = [person];
    server.use(
      http.get(path, () => HttpResponse.json(people)),
      http.post(path, async ({ request }) => {
        const input = (await request.json()) as Record<string, unknown>;
        const created = { ...person, ...input, id: "person-2" };
        people = [...people, created];
        return HttpResponse.json(created, { status: 201 });
      }),
      http.patch(`${path}/:personId`, async ({ params, request }) => {
        const input = (await request.json()) as Record<string, unknown>;
        const updated = {
          ...people.find((item) => item.id === params.personId)!,
          ...input,
        };
        people = people.map((item) =>
          item.id === params.personId ? updated : item,
        );
        return HttpResponse.json(updated);
      }),
      http.delete(`${path}/:personId`, ({ params }) => {
        people = people.filter((item) => item.id !== params.personId);
        return HttpResponse.json({ success: true });
      }),
    );
    const { result } = renderHookWithProviders(() =>
      useOpportunityPeople(analysisId),
    );

    await waitFor(() => expect(result.current.query.data).toEqual([person]));

    await act(async () => {
      await result.current.createPerson.mutateAsync({
        name: "Álex",
        role: "technical_interviewer",
        jobTitle: null,
        organization: null,
        email: null,
        phone: null,
        links: [],
        notes: null,
      });
    });
    await waitFor(() =>
      expect(result.current.query.data?.map((item) => item.id)).toEqual([
        "person-1",
        "person-2",
      ]),
    );

    await act(async () => {
      await result.current.updatePerson.mutateAsync({
        personId: "person-2",
        input: {
          name: "Álex R.",
          role: "technical_interviewer",
          jobTitle: null,
          organization: null,
          email: null,
          phone: null,
          links: [],
          notes: null,
        },
      });
    });
    await waitFor(() =>
      expect(result.current.query.data?.[1]?.name).toBe("Álex R."),
    );

    await act(async () => {
      await result.current.deletePerson.mutateAsync("person-2");
    });
    await waitFor(() =>
      expect(result.current.query.data?.map((item) => item.id)).toEqual([
        "person-1",
      ]),
    );
  });
});
