import { describe, expect, it } from "vitest";
import { CVExperience } from "./cv-experience.value-object";

describe("CVExperience", () => {
  it("round-trips with dates and bullets", () => {
    const primitives = {
      id: "exp-1",
      company: "Acme",
      role: "Engineer",
      dates: { start: "2020", current: true },
      bullets: ["Shipped X"],
      bulletIds: ["b-1"],
    };
    expect(CVExperience.fromPrimitives(primitives).toPrimitives()).toEqual(
      primitives,
    );
  });

  it("omits empty bullet arrays", () => {
    expect(CVExperience.fromPrimitives({ id: "exp-2" }).toPrimitives()).toEqual(
      {
        id: "exp-2",
      },
    );
  });
});
