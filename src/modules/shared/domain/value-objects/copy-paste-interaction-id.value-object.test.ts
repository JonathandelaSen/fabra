import { describe, expect, it } from "vitest";
import { CopyPasteInteractionId } from "./copy-paste-interaction-id.value-object";

describe("CopyPasteInteractionId", () => {
  it("allows null values", () => {
    const id = CopyPasteInteractionId.fromPrimitives(null);
    expect(id.toPrimitives()).toBeNull();
  });

  it("allows non-empty strings", () => {
    const id = CopyPasteInteractionId.fromPrimitives("interaction-456");
    expect(id.toPrimitives()).toBe("interaction-456");
  });

  it("trims whitespace from string values", () => {
    const id = CopyPasteInteractionId.fromPrimitives("  interaction-456  ");
    expect(id.toPrimitives()).toBe("interaction-456");
  });

  it("throws when empty string is provided", () => {
    expect(() => CopyPasteInteractionId.fromPrimitives("")).toThrow(
      "Copy paste interactionId cannot be empty when present."
    );
  });

  it("throws when whitespace-only string is provided", () => {
    expect(() => CopyPasteInteractionId.fromPrimitives("   ")).toThrow(
      "Copy paste interactionId cannot be empty when present."
    );
  });
});
