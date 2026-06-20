import { describe, expect, it } from "vitest";
import { CVBasics } from "./cv-basics.value-object";

describe("CVBasics", () => {
  it("round-trips text fields and nested links", () => {
    const primitives = {
      name: "Ada Lovelace",
      headline: "Engineer",
      email: "ada@x.dev",
      links: [{ label: "Site", url: "https://ada.dev" }],
    };
    expect(CVBasics.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
  });

  it("produces an empty object when no fields are present", () => {
    expect(CVBasics.fromPrimitives({}).toPrimitives()).toEqual({});
  });
});
