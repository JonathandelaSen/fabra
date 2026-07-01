import { describe, expect, it } from "vitest";
import { CVChatContent, InvalidCVChatContentError } from "./cv-chat-content.value-object";

describe("CVChatContent", () => {
  it("trims and round-trips content", () => {
    expect(CVChatContent.fromPrimitives("  Hola  ").toPrimitives()).toBe(
      "Hola",
    );
  });

  it("rejects blank content", () => {
    expect(() => CVChatContent.fromPrimitives(" ")).toThrow(
      InvalidCVChatContentError,
    );
  });
});
