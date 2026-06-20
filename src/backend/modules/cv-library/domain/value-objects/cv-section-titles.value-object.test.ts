import { describe, expect, it } from "vitest";
import { CVSectionTitles } from "./cv-section-titles.value-object";

describe("CVSectionTitles", () => {
  it("round-trips section title overrides", () => {
    const primitives = { experience: "Trayectoria", education: "Formación" };
    expect(CVSectionTitles.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
  });

  it("does not expose the original reference", () => {
    const primitives = { experience: "Trayectoria" };
    const vo = CVSectionTitles.fromPrimitives(primitives);
    expect(vo.toPrimitives()).not.toBe(primitives);
  });
});
