import { describe, expect, it } from "vitest";
import { CopyPasteOriginLabel } from "./copy-paste-origin-label.value-object";

describe("CopyPasteOriginLabel", () => {
  it("accepts external_chat and round-trips", () => {
    expect(CopyPasteOriginLabel.fromPrimitives("external_chat").toPrimitives()).toBe("external_chat");
  });

  it("rejects other values", () => {
    expect(() => CopyPasteOriginLabel.fromPrimitives("other")).toThrow();
  });
});
