import { describe, expect, it } from "vitest";
import { CVProfile } from "./cv-profile.value-object";
import { normalizeStandardCVProfile } from "../cv-profile";

describe("CVProfile", () => {
  it("round-trips a normalized profile", () => {
    const profile = normalizeStandardCVProfile({
      basics: { name: "Ada", email: "ada@x.dev" },
      summary: "Senior engineer",
      experience: [{ company: "Acme", role: "Eng", bullets: ["Shipped X"] }],
      skills: [{ name: "Languages", items: ["TS"] }],
      presentation: { accentColor: "#112233" },
    });
    expect(CVProfile.fromPrimitives(profile).toPrimitives()).toEqual(profile);
  });

  it("matches the normalizer output for a minimal profile", () => {
    const profile = normalizeStandardCVProfile({ summary: "Senior engineer" });
    expect(CVProfile.fromPrimitives(profile).toPrimitives()).toEqual(profile);
  });

  it("normalizes raw input the same way the normalizer does", () => {
    const raw = { summary: "  Trimmed  " };
    expect(CVProfile.fromPrimitives(raw).toPrimitives()).toEqual(
      normalizeStandardCVProfile(raw),
    );
  });
});
