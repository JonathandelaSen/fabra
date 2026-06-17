import { describe, expect, it } from "vitest";
import { CopyPasteResponseEnvelope } from "./copy-paste-response-envelope.value-object";

describe("CopyPasteResponseEnvelope", () => {
  it("allows true values", () => {
    const envelope = CopyPasteResponseEnvelope.fromPrimitives(true);
    expect(envelope.toPrimitives()).toBe(true);
  });

  it("allows false values", () => {
    const envelope = CopyPasteResponseEnvelope.fromPrimitives(false);
    expect(envelope.toPrimitives()).toBe(false);
  });

  it("allows null values", () => {
    const envelope = CopyPasteResponseEnvelope.fromPrimitives(null);
    expect(envelope.toPrimitives()).toBeNull();
  });
});
