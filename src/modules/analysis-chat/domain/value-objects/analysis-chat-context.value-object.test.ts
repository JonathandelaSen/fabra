import { describe, expect, it } from "vitest";
import { AnalysisChatContext } from "./analysis-chat-context.value-object";

describe("AnalysisChatContext", () => {
  it("can be created from primitives", () => {
    const primitives = {
      analysisId: "a-1",
      cvId: null,
      analysisMode: "general",
      analysis: {},
      cv: {},
      cvText: null,
    };
    const vo = AnalysisChatContext.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
