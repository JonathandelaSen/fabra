import { describe, expect, it } from "vitest";
import { CVLink } from "./cv-link.value-object";

describe("CVLink", () => {
  it("round-trips label and url", () => {
    const primitives = { label: "GitHub", url: "https://github.com/ada" };
    expect(CVLink.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
  });

  it("omits absent label", () => {
    expect(CVLink.fromPrimitives({ url: "https://x.dev" }).toPrimitives()).toEqual({
      url: "https://x.dev",
    });
  });
});
