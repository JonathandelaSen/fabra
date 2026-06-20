import { describe, expect, it } from "vitest";
import { InterviewAnswer } from "./interview-answer.value-object";

describe("InterviewAnswer", () => {
  it("round-trips its primitive value", () => {
    const answer = InterviewAnswer.fromPrimitives("A clear answer");
    expect(answer.toPrimitives()).toBe("A clear answer");
  });

  it("rejects empty values", () => {
    expect(() => InterviewAnswer.fromPrimitives("  ")).toThrow();
  });
});
