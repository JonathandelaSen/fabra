import { describe, expect, it } from "vitest";
import { EvalArtifactSaveResult } from "./eval-artifact-save-result.value-object";

describe("EvalArtifactSaveResult", () => {
  it("round-trips save result primitives", () => {
    const result = EvalArtifactSaveResult.fromPrimitives({
      caseId: "case-1",
      casePath: "/evals/case.json",
      runPath: "/evals/run.json",
      resultPath: null,
    });

    expect(result.toPrimitives()).toEqual({
      caseId: "case-1",
      casePath: "/evals/case.json",
      runPath: "/evals/run.json",
      resultPath: null,
    });
  });
});
