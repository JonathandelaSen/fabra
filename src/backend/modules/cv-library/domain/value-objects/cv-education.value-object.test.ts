import { describe, expect, it } from "vitest";
import { CVEducation } from "./cv-education.value-object";

describe("CVEducation", () => {
  it("round-trips with dates and details", () => {
    const primitives = {
      id: "edu-1",
      institution: "MIT",
      degree: "BSc",
      dates: { start: "2016", end: "2020" },
      details: ["Thesis"],
      detailIds: ["d-1"],
    };
    expect(CVEducation.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
  });

  it("omits empty detail arrays", () => {
    expect(CVEducation.fromPrimitives({ id: "edu-2" }).toPrimitives()).toEqual({
      id: "edu-2",
    });
  });
});
