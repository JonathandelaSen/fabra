import { describe, expect, it } from "vitest";
import { CVChatRole, InvalidCVChatRoleError } from "./cv-chat-role.value-object";

describe("CVChatRole", () => {
  it("accepts user and assistant roles", () => {
    expect(CVChatRole.fromPrimitives("user").toPrimitives()).toBe("user");
    expect(CVChatRole.fromPrimitives("assistant").toPrimitives()).toBe(
      "assistant",
    );
  });

  it("rejects unsupported roles", () => {
    expect(() => CVChatRole.fromPrimitives("system")).toThrow(
      InvalidCVChatRoleError,
    );
  });
});
