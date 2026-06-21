import { describe, expect, it } from "vitest";
import { CVNamedItem } from "./cv-named-item.value-object";

describe("CVNamedItem", () => {
  it("round-trips named item fields and bullets", () => {
    const primitives = {
      id: "n-1",
      name: "AWS Certified",
      issuer: "Amazon",
      date: "2023",
      url: "https://aws.dev/cert",
      description: "Solutions Architect",
      bullets: ["Scored 950"],
      bulletIds: ["nb-1"],
    };
    expect(CVNamedItem.fromPrimitives(primitives).toPrimitives()).toEqual(
      primitives,
    );
  });

  it("omits absent fields and empty arrays", () => {
    expect(
      CVNamedItem.fromPrimitives({ name: "Award" }).toPrimitives(),
    ).toEqual({
      name: "Award",
    });
  });
});
