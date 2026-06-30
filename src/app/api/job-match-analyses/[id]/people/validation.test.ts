import { describe, expect, it } from "vitest";
import { parseOpportunityPersonRequest } from "./validation";

describe("opportunity person validation", () => {
  it("normalizes a complete person profile", () => {
    expect(
      parseOpportunityPersonRequest({
        name: "  Marta García  ",
        role: "hiring_manager",
        jobTitle: "  Engineering Manager ",
        organization: "  Acme ",
        email: "  marta@example.com ",
        phone: "  +34 600 000 000 ",
        links: [
          {
            url: " https://linkedin.com/in/marta ",
            label: " LinkedIn ",
          },
          { url: "https://example.com/talk", label: "  " },
        ],
        notes: "  Owns platform reliability. ",
      }),
    ).toEqual({
      ok: true,
      value: {
        name: "Marta García",
        role: "hiring_manager",
        jobTitle: "Engineering Manager",
        organization: "Acme",
        email: "marta@example.com",
        phone: "+34 600 000 000",
        links: [
          { url: "https://linkedin.com/in/marta", label: "LinkedIn" },
          { url: "https://example.com/talk", label: null },
        ],
        notes: "Owns platform reliability.",
      },
    });
  });

  it("requires name and a supported role", () => {
    expect(parseOpportunityPersonRequest({ name: "", role: "wizard" })).toMatchObject({
      ok: false,
      error: { status: 400 },
    });
    expect(
      parseOpportunityPersonRequest({ name: "Marta", role: "wizard" }),
    ).toMatchObject({ ok: false, error: { status: 400 } });
  });

  it("rejects malformed email and unsafe links", () => {
    expect(
      parseOpportunityPersonRequest({
        name: "Marta",
        role: "hiring_manager",
        email: "not-an-email",
      }),
    ).toMatchObject({ ok: false, error: { status: 400 } });
    expect(
      parseOpportunityPersonRequest({
        name: "Marta",
        role: "hiring_manager",
        links: [{ url: "javascript:alert(1)", label: null }],
      }),
    ).toMatchObject({ ok: false, error: { status: 400 } });
  });

  it("normalizes omitted optional fields", () => {
    expect(
      parseOpportunityPersonRequest({
        name: "Marta",
        role: "technical_interviewer",
      }),
    ).toEqual({
      ok: true,
      value: {
        name: "Marta",
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
});
