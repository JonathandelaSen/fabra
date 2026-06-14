import { describe, expect, it } from "vitest";
import { CVChatContext } from "./cv-chat-context.value-object";

describe("CVChatContext", () => {
  it("round-trips CV context", () => {
    const value = { cvId: "cv-1", cv: { title: "CV" }, cvText: "text" };
    expect(CVChatContext.fromPrimitives(value).toPrimitives()).toEqual(value);
  });
});
