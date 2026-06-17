import { describe, expect, it } from "vitest";
import { CVChatSnapshot } from "./cv-chat-snapshot.value-object";

describe("CVChatSnapshot", () => {
  it("round-trips an arbitrary snapshot payload", () => {
    const payload = { messages: [{ role: "user", text: "hi" }] };
    expect(CVChatSnapshot.fromPrimitives(payload).toPrimitives()).toEqual(payload);
  });

  it("round-trips null", () => {
    expect(CVChatSnapshot.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
