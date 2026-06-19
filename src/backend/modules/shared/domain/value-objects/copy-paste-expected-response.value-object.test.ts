import { describe, expect, it } from "vitest";
import { CopyPasteExpectedResponse } from "./copy-paste-expected-response.value-object";

describe("CopyPasteExpectedResponse", () => {
  it("round-trips standard json configuration", () => {
    const primitives = { kind: "json", envelope: true };
    const expected = CopyPasteExpectedResponse.fromPrimitives(primitives);
    expect(expected.toPrimitives()).toEqual(primitives);
  });

  it("round-trips plain text configuration", () => {
    const primitives = { kind: "plain_text", envelope: null };
    const expected = CopyPasteExpectedResponse.fromPrimitives(primitives);
    expect(expected.toPrimitives()).toEqual(primitives);
  });

  it("throws when invalid kind is provided", () => {
    expect(() =>
      CopyPasteExpectedResponse.fromPrimitives({ kind: "invalid-kind", envelope: null })
    ).toThrow();
  });
});
