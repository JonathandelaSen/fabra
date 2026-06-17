import { describe, expect, it } from "vitest";
import { ProcessQuestionCVKind } from "./process-question-cv-kind.value-object";

describe("ProcessQuestionCVKind", () => {
  it("round-trips valid types", () => {
    expect(ProcessQuestionCVKind.fromPrimitives("uploaded").toPrimitives()).toBe("uploaded");
    expect(ProcessQuestionCVKind.fromPrimitives("template").toPrimitives()).toBe("template");
  });

  it("rejects an invalid type", () => {
    expect(() => ProcessQuestionCVKind.fromPrimitives("nope")).toThrow();
  });
});
