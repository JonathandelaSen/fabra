import { describe, expect, it } from "vitest";
import { isAIProvider, parseAIProvider } from "./ai-provider.value-object";

describe("AIProvider", () => {
  it("accepts supported AI providers", () => {
    expect(isAIProvider("gemini")).toBe(true);
    expect(isAIProvider("openai")).toBe(true);
    expect(isAIProvider("mock")).toBe(true);
  });

  it("rejects unsupported AI providers", () => {
    expect(isAIProvider("claude")).toBe(false);
    expect(isAIProvider("")).toBe(false);
    expect(isAIProvider(null)).toBe(false);
  });

  it("parses a supported provider", () => {
    expect(parseAIProvider("gemini")).toBe("gemini");
    expect(parseAIProvider("openai")).toBe("openai");
  });

  it("throws a controlled error for unsupported providers", () => {
    expect(() => parseAIProvider("claude")).toThrow("Unsupported AI provider.");
  });
});
