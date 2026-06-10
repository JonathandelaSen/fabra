import { describe, expect, it, vi } from "vitest";
import {
  copyPasteRepo,
  eventBus,
  validCopyPasteResult,
} from "./cv-score-copy-paste-test-helpers";
import { ApplyCVScoreCopyPasteUseCase } from "./apply-cv-score-copy-paste.use-case";

describe("ApplyCVScoreCopyPasteUseCase", () => {
  it("applies a valid parsed result with external chat provenance", async () => {
    const repo = copyPasteRepo();
    const bus = eventBus();

    const result = await new ApplyCVScoreCopyPasteUseCase({
      repo,
      eventBus: bus,
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
    expect(bus.publish).toHaveBeenCalledWith([
      expect.objectContaining({
        eventName: "cv_analysis_scored",
      }),
    ]);
  });

  it("rejects invalid parsed results", async () => {
    await expect(
      new ApplyCVScoreCopyPasteUseCase({
        repo: copyPasteRepo(),
        eventBus: eventBus(),
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
      eventBus: eventBus(),
    }).execute({
      id: "missing",
      userId: "user-1",
      parsedResult: validCopyPasteResult,
    });

    expect(result).toBeNull();
  });
});
