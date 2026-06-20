import { describe, expect, it } from "vitest";
import { EditedCVProfile } from "./edited-cv-profile.value-object";
import { normalizeStandardCVProfile } from "../cv-profile";

describe("EditedCVProfile", () => {
  it("round-trips the profile primitives", () => {
    const profile = normalizeStandardCVProfile({ summary: "Senior engineer" });
    const vo = EditedCVProfile.fromPrimitives(profile);
    expect(vo.toPrimitives()).toEqual(profile);
  });
});
