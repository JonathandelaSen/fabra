import { describe, expect, it } from "vitest";
import { AIInteractionParsedResult } from "./ai-interaction-parsed-result.value-object";

describe("AIInteractionParsedResult", () => {
  it("round-trips an arbitrary payload", () => {
    const payload = { items: [1, 2], ok: true };
    expect(AIInteractionParsedResult.fromPrimitives(payload).toPrimitives()).toEqual(payload);
  });

  it("round-trips null", () => {
    expect(AIInteractionParsedResult.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
