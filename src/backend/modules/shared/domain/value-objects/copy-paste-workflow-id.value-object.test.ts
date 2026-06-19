import { describe, expect, it } from "vitest";
import { CopyPasteWorkflowId } from "./copy-paste-workflow-id.value-object";

describe("CopyPasteWorkflowId", () => {
  it("allows non-empty strings", () => {
    const workflowId = CopyPasteWorkflowId.fromPrimitives("cv_analysis.score");
    expect(workflowId.toPrimitives()).toBe("cv_analysis.score");
  });

  it("trims whitespace from string values", () => {
    const workflowId = CopyPasteWorkflowId.fromPrimitives("  cv_analysis.score  ");
    expect(workflowId.toPrimitives()).toBe("cv_analysis.score");
  });

  it("throws when empty string is provided", () => {
    expect(() => CopyPasteWorkflowId.fromPrimitives("")).toThrow(
      "Copy paste workflowId cannot be empty."
    );
  });

  it("throws when whitespace-only string is provided", () => {
    expect(() => CopyPasteWorkflowId.fromPrimitives("   ")).toThrow(
      "Copy paste workflowId cannot be empty."
    );
  });
});
