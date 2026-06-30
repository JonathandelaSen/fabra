import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createOpportunityPerson,
  deleteOpportunityPerson,
  listOpportunityPeople,
  updateOpportunityPerson,
  type OpportunityPersonInput,
} from "./opportunity-people-api";

const person = {
  id: "person-1",
  name: "Marta García",
  role: "hiring_manager" as const,
  jobTitle: "Engineering Manager",
  organization: "Acme",
  email: "marta@example.com",
  phone: null,
  links: [{ url: "https://example.com/marta", label: "Profile" }],
  notes: "Owns platform reliability.",
  createdAt: "2026-06-30T09:00:00.000Z",
  updatedAt: "2026-06-30T09:00:00.000Z",
};

const input: OpportunityPersonInput = {
  name: person.name,
  role: person.role,
  jobTitle: person.jobTitle,
  organization: person.organization,
  email: person.email,
  phone: person.phone,
  links: person.links,
  notes: person.notes,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("opportunity people API", () => {
  it("lists people for an encoded analysis id", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify([person]), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(listOpportunityPeople("analysis/1")).resolves.toEqual([
      person,
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/job-match-analyses/analysis%2F1/people",
    );
  });

  it("creates a person with the camelCase response contract", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify(person), { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(createOpportunityPerson("analysis-1", input)).resolves.toEqual(
      person,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/job-match-analyses/analysis-1/people",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(input),
      }),
    );
  });

  it("updates an encoded person id", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify(person), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await updateOpportunityPerson("analysis-1", "person/1", input);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/job-match-analyses/analysis-1/people/person%2F1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("deletes a person", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      deleteOpportunityPerson("analysis-1", "person-1"),
    ).resolves.toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/job-match-analyses/analysis-1/people/person-1",
      { method: "DELETE" },
    );
  });
});
