import { describe, expect, it } from "vitest";
import { ProcessQuestionRelatedCV } from "./process-question-related-cv.value-object";

describe("ProcessQuestionRelatedCV", () => {
  it("round-trips full primitives", () => {
    const primitives = {
      id: "cv-1",
      name: "CV principal",
      filename: "cv.pdf",
      type: "uploaded",
    };
    const vo = ProcessQuestionRelatedCV.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
    expect(vo.type).toBe("uploaded");
  });

  it("supports a null filename", () => {
    const primitives = {
      id: "cv-2",
      name: "Template",
      filename: null,
      type: "template",
    };
    expect(ProcessQuestionRelatedCV.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
  });

  it("rejects an invalid type", () => {
    expect(() =>
      ProcessQuestionRelatedCV.fromPrimitives({ id: "cv-3", name: "X", filename: null, type: "nope" })
    ).toThrow();
  });
});
