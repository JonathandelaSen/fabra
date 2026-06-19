import { describe, expect, it } from "vitest";
import { JobAnalysisChatContext } from "./job-analysis-chat-context.value-object";

describe("JobAnalysisChatContext", () => {
  it("can be created from primitives", () => {
    const primitives = {
      analysisId: "a-1",
      cvId: null,
      analysisMode: "general",
      analysis: {},
      cv: {},
      cvText: null,
    };
    const vo = JobAnalysisChatContext.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
