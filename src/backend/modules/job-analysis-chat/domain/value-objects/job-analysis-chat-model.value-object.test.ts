import { describe, expect, it } from "vitest";
import { JobAnalysisChatModel } from "./job-analysis-chat-model.value-object";

describe("JobAnalysisChatModel", () => {
  it("round-trips a model name", () => {
    expect(JobAnalysisChatModel.fromPrimitives("mock-model").toPrimitives()).toBe("mock-model");
  });

  it("allows null when no model is attached", () => {
    expect(JobAnalysisChatModel.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
