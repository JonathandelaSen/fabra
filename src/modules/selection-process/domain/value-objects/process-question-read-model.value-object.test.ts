import { describe, expect, it } from "vitest";
import { ProcessQuestionReadModel } from "./process-question-read-model.value-object";

describe("ProcessQuestionReadModel", () => {
  it("can be created from primitives", () => {
    const primitives = {
      question: {} as any,
      cv: null,
      analysis: null,
    };
    const vo = ProcessQuestionReadModel.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
