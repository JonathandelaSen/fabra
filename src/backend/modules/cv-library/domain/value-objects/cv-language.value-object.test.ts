import { describe, expect, it } from "vitest";
import { CVLanguage } from "./cv-language.value-object";

describe("CVLanguage", () => {
  it("round-trips name and level", () => {
    const primitives = { id: "l-1", name: "English", level: "C1" };
    expect(CVLanguage.fromPrimitives(primitives).toPrimitives()).toEqual(
      primitives,
    );
  });

  it("omits absent fields", () => {
    expect(
      CVLanguage.fromPrimitives({ name: "Spanish" }).toPrimitives(),
    ).toEqual({
      name: "Spanish",
    });
  });
});
