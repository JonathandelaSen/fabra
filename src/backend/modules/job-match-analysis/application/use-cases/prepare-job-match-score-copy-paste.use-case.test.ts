import { describe, expect, it, vi } from "vitest";
import { jobMatchRepo } from "./job-match-score-copy-paste-test-helpers";
import { PrepareJobMatchScoreCopyPasteUseCase } from "./prepare-job-match-score-copy-paste.use-case";

describe("PrepareJobMatchScoreCopyPasteUseCase", () => {
  it("builds an external chat prompt for an owned analysis", async () => {
    const repo = jobMatchRepo();
    const buildPrompt = vi.fn(() => "prompt with job_match_analysis.score");

    const result = await new PrepareJobMatchScoreCopyPasteUseCase({
      repo,
      buildPrompt,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      jobDescription: "Senior React Dev",
      jobUrl: "https://example.com/job",
    });

    expect(buildPrompt).toHaveBeenCalledWith({
      text: "extracted cv text for job match",
      jobDescription: "Senior React Dev",
      jobUrl: "https://example.com/job",
    });
    expect(result).toMatchObject({
      workflowId: "job_match_analysis.score",
      schemaVersion: "1",
      expectedResponse: { kind: "json", envelope: true },
    });
    expect(result?.privacyNotice).toContain("CV data");
  });

  it("returns null for a missing analysis", async () => {
    const result = await new PrepareJobMatchScoreCopyPasteUseCase({
      repo: jobMatchRepo(null),
      buildPrompt: vi.fn(),
    }).execute({
      id: "missing",
      userId: "user-1",
      jobDescription: "desc",
    });

    expect(result).toBeNull();
  });

  it("does not call AI service", async () => {
    const buildPrompt = vi.fn(() => "prompt");
    await new PrepareJobMatchScoreCopyPasteUseCase({
      repo: jobMatchRepo(),
      buildPrompt,
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      jobDescription: "desc",
    });

    expect(buildPrompt).toHaveBeenCalledTimes(1);
  });
});
