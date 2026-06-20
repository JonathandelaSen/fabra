import { describe, expect, it } from "vitest";
import { CVProfileData } from "./cv-profile-data.value-object";

describe("CVProfileData", () => {
  it("round-trips an arbitrary profile payload", () => {
    const profile = { basics: { name: "Test" }, skills: ["ts"] };
    expect(CVProfileData.fromPrimitives(profile).toPrimitives()).toEqual(profile);
  });

  it("normalizes undefined to null", () => {
    expect(CVProfileData.fromPrimitives(undefined).toPrimitives()).toBeNull();
  });
});
