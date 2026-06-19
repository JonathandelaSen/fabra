import { describe, expect, it } from "vitest";
import { CVChatMessageId } from "./cv-chat-message-id.value-object";

describe("CVChatMessageId", () => {
  it("round-trips a valid id", () => {
    expect(
      CVChatMessageId.fromPrimitives("message-1").toPrimitives(),
    ).toBe("message-1");
  });

  it("rejects empty ids", () => {
    expect(() => CVChatMessageId.fromPrimitives(" ")).toThrow(
      "Analysis chat message id cannot be empty",
    );
  });
});
