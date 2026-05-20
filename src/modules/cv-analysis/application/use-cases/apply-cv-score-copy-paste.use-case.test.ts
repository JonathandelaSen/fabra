import { describe, expect, it } from "vitest";
import {
  copyPasteRepo,
  copyPasteTracker,
  validCopyPasteResult,
} from "./cv-score-copy-paste-test-helpers";
import { ApplyCVScoreCopyPasteUseCase } from "./apply-cv-score-copy-paste.use-case";

describe("ApplyCVScoreCopyPasteUseCase", () => {
  it("applies a valid parsed result with external chat provenance", async () => {
    const repo = copyPasteRepo();
    const tracker = copyPasteTracker();

    const result = await new ApplyCVScoreCopyPasteUseCase({
      repo,
      tracker,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      parsedResult: validCopyPasteResult,
    });

    expect(result?.toPrimitives()).toMatchObject({
      aiModel: "external-chat",
      score: 88,
      feedback: "Buen CV con margen de mejora.",
      keywords: ["TypeScript", "React"],
      improvements: ["Añade métricas"],
    });
    expect(tracker.record).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: "cv_analysis_copy_paste_result_applied",
        metadata: expect.objectContaining({
          assistanceMode: "copy_paste",
          workflowId: "cv_analysis.score",
          model: "external-chat",
        }),
      }),
    );
  });

  it("rejects invalid parsed results", async () => {
    await expect(
      new ApplyCVScoreCopyPasteUseCase({
        repo: copyPasteRepo(),
        tracker: copyPasteTracker(),
      }).execute({
        id: "analysis-1",
        userId: "user-1",
        parsedResult: {
          ...validCopyPasteResult,
          score: -1,
        },
      }),
    ).rejects.toThrow("score");
  });

  it("returns null for missing analysis", async () => {
    const result = await new ApplyCVScoreCopyPasteUseCase({
      repo: copyPasteRepo(null),
      tracker: copyPasteTracker(),
    }).execute({
      id: "missing",
      userId: "user-1",
      parsedResult: validCopyPasteResult,
    });

    expect(result).toBeNull();
  });
});
