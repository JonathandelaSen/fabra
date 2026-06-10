import { describe, expect, it, vi } from "vitest";
import { copyPasteRepo } from "./cv-score-copy-paste-test-helpers";
import { PrepareCVScoreCopyPasteUseCase } from "./prepare-cv-score-copy-paste.use-case";

describe("PrepareCVScoreCopyPasteUseCase", () => {
  it("builds an external chat prompt for an owned analysis", async () => {
    const repo = copyPasteRepo();
    const buildPrompt = vi.fn(() => "prompt with cv_analysis.score schemaVersion 1");

    const result = await new PrepareCVScoreCopyPasteUseCase({
      repo,
      buildPrompt,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      additionalContext: "Senior frontend",
    });

    expect(buildPrompt).toHaveBeenCalledWith({
      text: "extracted cv text",
      additionalContext: "Senior frontend",
    });
    expect(result).toMatchObject({
      workflowId: "cv_analysis.score",
      schemaVersion: "1",
      expectedResponse: { kind: "json", envelope: true },
    });
    expect(result?.privacyNotice).toContain("CV data");
  });

  it("returns null for a missing analysis", async () => {
    const result = await new PrepareCVScoreCopyPasteUseCase({
      repo: copyPasteRepo(null),
      buildPrompt: vi.fn(),
    }).execute({ id: "missing", userId: "user-1" });

    expect(result).toBeNull();
  });
});
