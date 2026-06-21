import { describe, expect, it } from "vitest";
import { CVPresentation } from "./cv-presentation.value-object";
import type { CVPresentationPrimitives } from "./cv-presentation.value-object";

describe("CVPresentation", () => {
  it("round-trips presentation settings", () => {
    const primitives: CVPresentationPrimitives = {
      sectionTitles: { experience: "Trayectoria" },
      sectionOrder: ["experience", "education"],
      accentColor: "#112233",
      tagsColor: "#445566",
      hiddenSections: ["awards"],
    };
    expect(CVPresentation.fromPrimitives(primitives).toPrimitives()).toEqual(
      primitives,
    );
  });

  it("omits absent fields", () => {
    expect(
      CVPresentation.fromPrimitives({ accentColor: "#000000" }).toPrimitives(),
    ).toEqual({ accentColor: "#000000" });
  });
});
