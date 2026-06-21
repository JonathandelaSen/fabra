import { describe, expect, it } from "vitest";
import { StructuredCVProfileData } from "./structured-cv-profile-data.value-object";

describe("StructuredCVProfileData", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      schemaVersion: "cv-profile.v1",
      profile: {
        basics: { name: "Ada Lovelace" },
      },
    };
    const vo = StructuredCVProfileData.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toMatchObject({
      schemaVersion: "cv-profile.v1",
      profile: {
        basics: { name: "Ada Lovelace" },
        experience: [],
        education: [],
        skills: [],
      },
    });
    expect(vo.schemaVersion).toBe("cv-profile.v1");
  });
});
