import { describe, expect, it } from "vitest";
import {
  copyPasteRepo,
  makeCopyPasteAnalysis,
  validCopyPasteEnvelope,
} from "./cv-score-copy-paste-test-helpers";
import { PreviewCVScoreCopyPasteUseCase } from "./preview-cv-score-copy-paste.use-case";

describe("PreviewCVScoreCopyPasteUseCase", () => {
  it("previews a valid enveloped response without persisting", async () => {
    const repo = copyPasteRepo();
    const result = await new PreviewCVScoreCopyPasteUseCase({
      repo,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      rawResponse: validCopyPasteEnvelope,
    });

    expect(result?.preview).toMatchObject({
      score: 88,
      strengthsCount: 2,
      improvementAreasCount: 1,
      recommendationsCount: 1,
      originLabel: "external_chat",
      willReplaceExistingResult: false,
    });
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("marks replacement when an analysis already has a score", async () => {
    const result = await new PreviewCVScoreCopyPasteUseCase({
      repo: copyPasteRepo(makeCopyPasteAnalysis({ score: 70 })),
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      rawResponse: validCopyPasteEnvelope,
    });

    expect(result?.preview.willReplaceExistingResult).toBe(true);
  });

  it("rejects invalid workflow and score shape", async () => {
    const useCase = new PreviewCVScoreCopyPasteUseCase({
      repo: copyPasteRepo(),
    });

    await expect(
      useCase.execute({
        id: "analysis-1",
        userId: "user-1",
        rawResponse: JSON.stringify({
          workflowId: "other",
          schemaVersion: "1",
          result: { score: 88 },
        }),
      }),
    ).rejects.toThrow("different workflow");

    await expect(
      useCase.execute({
        id: "analysis-1",
        userId: "user-1",
        rawResponse: JSON.stringify({
          workflowId: "cv_analysis.score",
          schemaVersion: "1",
          result: { score: 101, feedback: "x", keywords: [], improvements: [] },
        }),
      }),
    ).rejects.toThrow("score");
  });
});
