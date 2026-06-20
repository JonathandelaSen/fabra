import { describe, expect, it } from "vitest";
import { CVChatModel } from "./cv-chat-model.value-object";

describe("CVChatModel", () => {
  it("round-trips a model name", () => {
    expect(CVChatModel.fromPrimitives("mock-model").toPrimitives()).toBe("mock-model");
  });

  it("allows null when no model is attached", () => {
    expect(CVChatModel.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
