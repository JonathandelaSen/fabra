import { describe, expect, it } from "vitest";
import { JobAnalysisChatMessageId } from "./job-analysis-chat-message-id.value-object";

describe("JobAnalysisChatMessageId", () => {
  it("round-trips a valid id", () => {
    expect(
      JobAnalysisChatMessageId.fromPrimitives("message-1").toPrimitives(),
    ).toBe("message-1");
  });

  it("rejects empty ids", () => {
    expect(() => JobAnalysisChatMessageId.fromPrimitives(" ")).toThrow(
      "Analysis chat message id cannot be empty",
    );
  });
});
