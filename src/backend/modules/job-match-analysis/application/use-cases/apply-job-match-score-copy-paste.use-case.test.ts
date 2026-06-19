import { describe, expect, it } from "vitest";
import {
  jobMatchRepo,
  eventBus,
  makeJobMatchAnalysis,
  validJobMatchResult,
} from "./job-match-score-copy-paste-test-helpers";
import { ApplyJobMatchScoreCopyPasteUseCase } from "./apply-job-match-score-copy-paste.use-case";

describe("ApplyJobMatchScoreCopyPasteUseCase", () => {
  it("applies a valid parsed result", async () => {
    const repo = jobMatchRepo();
    const bus = eventBus();
    const result = await new ApplyJobMatchScoreCopyPasteUseCase({
      repo,
      eventBus: bus,
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
    expect(bus.publish).toHaveBeenCalled();
  });

  it("replaces existing score when present", async () => {
    const scored = makeJobMatchAnalysis({ score: 50 });
    const repo = jobMatchRepo(scored);
    const bus = eventBus();
    const result = await new ApplyJobMatchScoreCopyPasteUseCase({
      repo,
      eventBus: bus,
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
    const bus = eventBus();
    await expect(
      new ApplyJobMatchScoreCopyPasteUseCase({
        repo: jobMatchRepo(),
        eventBus: bus,
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
    const bus = eventBus();
    const result = await new ApplyJobMatchScoreCopyPasteUseCase({
      repo: jobMatchRepo(null),
      eventBus: bus,
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
