import { describe, expect, it } from "vitest";
import { JobAnalysisChatConversationId } from "./job-analysis-chat-conversation-id.value-object";

describe("JobAnalysisChatConversationId", () => {
  it("round-trips a valid id", () => {
    expect(
      JobAnalysisChatConversationId.fromPrimitives(
        "conversation-1",
      ).toPrimitives(),
    ).toBe("conversation-1");
  });

  it("rejects empty ids", () => {
    expect(() => JobAnalysisChatConversationId.fromPrimitives(" ")).toThrow(
      "Analysis chat conversation id cannot be empty",
    );
  });
});
