import { describe, expect, it } from "vitest";
import { CVChatConversationId } from "./cv-chat-conversation-id.value-object";

describe("CVChatConversationId", () => {
  it("round-trips a valid id", () => {
    expect(
      CVChatConversationId.fromPrimitives(
        "conversation-1",
      ).toPrimitives(),
    ).toBe("conversation-1");
  });

  it("rejects empty ids", () => {
    expect(() => CVChatConversationId.fromPrimitives(" ")).toThrow(
      "Analysis chat conversation id cannot be empty",
    );
  });
});
