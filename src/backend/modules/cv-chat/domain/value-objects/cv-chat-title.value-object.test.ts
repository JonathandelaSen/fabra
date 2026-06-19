import { describe, expect, it } from "vitest";
import { CVChatTitle } from "./cv-chat-title.value-object";

describe("CVChatTitle", () => {
  it("trims a valid title", () => {
    expect(
      CVChatTitle.fromPrimitives("  Conversación  ").toPrimitives(),
    ).toBe("Conversación");
  });

  it("rejects blank titles", () => {
    expect(() => CVChatTitle.fromPrimitives(" ")).toThrow(
      "Analysis chat title cannot be empty",
    );
  });
});
