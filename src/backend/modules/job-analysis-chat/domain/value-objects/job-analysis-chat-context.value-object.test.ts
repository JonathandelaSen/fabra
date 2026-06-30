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
      people: [
        {
          name: "Marta García",
          role: "hiring_manager",
          jobTitle: "Engineering Manager",
          organization: "Acme",
          links: [{ url: "https://example.com/marta", label: "Profile" }],
          notes: "Owns platform reliability.",
        },
      ],
    };
    const vo = JobAnalysisChatContext.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
