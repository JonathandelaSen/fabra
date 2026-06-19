import { describe, expect, it } from "vitest";
import { CopyPastePrompt } from "./copy-paste-prompt.value-object";

describe("CopyPastePrompt", () => {
  it("allows non-empty strings", () => {
    const prompt = CopyPastePrompt.fromPrimitives("Analyze this CV please");
    expect(prompt.toPrimitives()).toBe("Analyze this CV please");
  });

  it("trims whitespace from string values", () => {
    const prompt = CopyPastePrompt.fromPrimitives("  Analyze this CV please  ");
    expect(prompt.toPrimitives()).toBe("Analyze this CV please");
  });

  it("throws when empty string is provided", () => {
    expect(() => CopyPastePrompt.fromPrimitives("")).toThrow(
      "Copy paste prompt cannot be empty."
    );
  });

  it("throws when whitespace-only string is provided", () => {
    expect(() => CopyPastePrompt.fromPrimitives("   ")).toThrow(
      "Copy paste prompt cannot be empty."
    );
  });
});
