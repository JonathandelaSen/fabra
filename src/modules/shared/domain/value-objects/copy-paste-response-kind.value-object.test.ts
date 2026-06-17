import { describe, expect, it } from "vitest";
import { CopyPasteResponseKind } from "./copy-paste-response-kind.value-object";

describe("CopyPasteResponseKind", () => {
  it("allows 'json'", () => {
    const kind = CopyPasteResponseKind.fromPrimitives("json");
    expect(kind.toPrimitives()).toBe("json");
  });

  it("allows 'plain_text'", () => {
    const kind = CopyPasteResponseKind.fromPrimitives("plain_text");
    expect(kind.toPrimitives()).toBe("plain_text");
  });

  it("throws when invalid response kind is provided", () => {
    expect(() => CopyPasteResponseKind.fromPrimitives("html")).toThrow(
      "Invalid copy paste response kind: html"
    );
  });
});
