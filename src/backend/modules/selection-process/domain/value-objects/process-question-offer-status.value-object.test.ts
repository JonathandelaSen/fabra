import { describe, expect, it } from "vitest";
import { ProcessQuestionOfferStatus } from "./process-question-offer-status.value-object";

describe("ProcessQuestionOfferStatus", () => {
  it("round-trips a valid offer status", () => {
    expect(ProcessQuestionOfferStatus.fromPrimitives("applied").toPrimitives()).toBe("applied");
  });

  it("rejects an invalid offer status", () => {
    expect(() => ProcessQuestionOfferStatus.fromPrimitives("pending")).toThrow();
  });
});
