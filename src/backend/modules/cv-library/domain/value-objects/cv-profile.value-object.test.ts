import { describe, expect, it } from "vitest";
import { CVProfile } from "./cv-profile.value-object";

describe("CVProfile", () => {
  it("normalizes profile primitives when created", () => {
    const profile = CVProfile.fromPrimitives({
      basics: { name: "Ada", email: "ada@x.dev" },
      summary: "Senior engineer",
      experience: [{ company: "Acme", role: "Eng", bullets: ["Shipped X"] }],
      skills: [{ name: "Languages", items: ["TS"] }],
      presentation: { accentColor: "#112233" },
    }).toPrimitives();

    expect(profile).toEqual({
      basics: { name: "Ada", email: "ada@x.dev" },
      summary: "Senior engineer",
      experience: [
        {
          id: expect.any(String),
          company: "Acme",
          role: "Eng",
          bullets: ["Shipped X"],
          bulletIds: [expect.any(String)],
        },
      ],
      education: [],
      skills: [{ id: expect.any(String), name: "Languages", items: ["TS"] }],
      languages: [],
      certifications: [],
      projects: [],
      awards: [],
      publications: [],
      technicalSkills: [],
      volunteering: [],
      presentation: { accentColor: "#112233" },
    });
  });

  it("trims raw input through fromPrimitives", () => {
    const raw = { summary: "  Trimmed  " };
    expect(CVProfile.fromPrimitives(raw).toPrimitives().summary).toBe("Trimmed");
  });
});
