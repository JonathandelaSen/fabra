import { describe, expect, it } from "vitest";
import {
  jobMatchRepo,
  jobMatchTracker,
  makeJobMatchAnalysis,
  validJobMatchResult,
} from "./job-match-score-copy-paste-test-helpers";
import { ApplyJobMatchScoreCopyPasteUseCase } from "./apply-job-match-score-copy-paste.use-case";

describe("ApplyJobMatchScoreCopyPasteUseCase", () => {
  it("applies a valid parsed result", async () => {
    const repo = jobMatchRepo();
    const tracker = jobMatchTracker();
    const result = await new ApplyJobMatchScoreCopyPasteUseCase({
      repo,
      tracker,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      parsedResult: validJobMatchResult,
      jobDescription: "Senior React Dev",
      jobUrl: "https://example.com/job",
    });

    expect(result).not.toBeNull();
    expect(repo.save).toHaveBeenCalled();
    const saved = repo.save.mock.calls[0][0].toPrimitives();
    expect(saved.score).toBe(74);
    expect(saved.aiModel).toBe("external-chat");
    expect(saved.feedback).toBe("Buena coincidencia con la oferta.");
    expect(saved.matchingKeywords).toEqual(["React", "TypeScript"]);
    expect(saved.missingKeywords).toEqual(["Node"]);
    expect(saved.analyzedAt).toBeTruthy();
    expect(tracker.record).toHaveBeenCalled();
  });

  it("replaces existing score when present", async () => {
    const scored = makeJobMatchAnalysis({ score: 50 });
    const repo = jobMatchRepo(scored);
    const result = await new ApplyJobMatchScoreCopyPasteUseCase({
      repo,
      tracker: jobMatchTracker(),
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      parsedResult: validJobMatchResult,
      jobDescription: "desc",
      jobUrl: null,
    });

    expect(result).not.toBeNull();
    const saved = repo.save.mock.calls[0][0].toPrimitives();
    expect(saved.score).toBe(74);
  });

  it("rejects invalid parsed result", async () => {
    await expect(
      new ApplyJobMatchScoreCopyPasteUseCase({
        repo: jobMatchRepo(),
        tracker: jobMatchTracker(),
      }).execute({
        id: "analysis-1",
        userId: "user-1",
        parsedResult: { score: -1 } as never,
        jobDescription: "desc",
        jobUrl: null,
      }),
    ).rejects.toThrow();
  });

  it("returns null for missing analysis", async () => {
    const result = await new ApplyJobMatchScoreCopyPasteUseCase({
      repo: jobMatchRepo(null),
      tracker: jobMatchTracker(),
    }).execute({
      id: "missing",
      userId: "user-1",
      parsedResult: validJobMatchResult,
      jobDescription: "desc",
      jobUrl: null,
    });
    expect(result).toBeNull();
  });
});
