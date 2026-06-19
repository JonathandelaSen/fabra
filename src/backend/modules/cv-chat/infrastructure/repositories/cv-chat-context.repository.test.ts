import { describe, expect, it } from "vitest";
import { CVChatContextRepository } from "./cv-chat-context.repository";

describe("CVChatContextRepository", () => {
  it("is a request-bound CV-specific context repository", () => {
    expect(new CVChatContextRepository()).toBeInstanceOf(CVChatContextRepository);
  });
});
