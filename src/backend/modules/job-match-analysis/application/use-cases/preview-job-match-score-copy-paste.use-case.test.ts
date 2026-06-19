import { describe, expect, it } from "vitest";
import {
  jobMatchRepo,
  makeJobMatchAnalysis,
  validJobMatchEnvelope,
} from "./job-match-score-copy-paste-test-helpers";
import { PreviewJobMatchScoreCopyPasteUseCase } from "./preview-job-match-score-copy-paste.use-case";

describe("PreviewJobMatchScoreCopyPasteUseCase", () => {
  it("accepts a valid enveloped response and returns preview", async () => {
    const result = await new PreviewJobMatchScoreCopyPasteUseCase({
      repo: jobMatchRepo(),
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      rawResponse: validJobMatchEnvelope,
    });

    expect(result).not.toBeNull();
    expect(result!.parsedResult.score).toBe(74);
    expect(result!.preview.score).toBe(74);
    expect(result!.preview.matchingKeywordsCount).toBe(2);
    expect(result!.preview.missingKeywordsCount).toBe(1);
    expect(result!.preview.jobKeywordsCount).toBe(3);
    expect(result!.preview.recommendationsCount).toBe(1);
    expect(result!.preview.originLabel).toBe("external_chat");
    expect(result!.preview.willReplaceExistingResult).toBe(false);
    expect(result!.warnings).toHaveLength(0);
  });

  it("marks willReplaceExistingResult true for scored analysis", async () => {
    const scored = makeJobMatchAnalysis({ score: 50 });
    const result = await new PreviewJobMatchScoreCopyPasteUseCase({
      repo: jobMatchRepo(scored),
    }).execute({
      id: "analysis-1",
      userId: "user-1",
      rawResponse: validJobMatchEnvelope,
    });

    expect(result!.preview.willReplaceExistingResult).toBe(true);
    expect(result!.warnings).toContain(
      "This will replace the current analysis result.",
    );
  });

  it("rejects wrong workflow id", async () => {
    const bad = JSON.stringify({
      workflowId: "wrong.id",
      schemaVersion: "1",
      result: {},
    });
    await expect(
      new PreviewJobMatchScoreCopyPasteUseCase({
        repo: jobMatchRepo(),
      }).execute({ id: "analysis-1", userId: "user-1", rawResponse: bad }),
    ).rejects.toThrow();
  });

  it("rejects invalid score", async () => {
    const bad = JSON.stringify({
      workflowId: "job_match_analysis.score",
      schemaVersion: "1",
      result: { score: 200, feedback: "ok", aiKeywords: [], improvements: [], jobKeyData: null, jobKeywords: [], cvKeywords: [], matchingKeywords: [], missingKeywords: [] },
    });
    await expect(
      new PreviewJobMatchScoreCopyPasteUseCase({
        repo: jobMatchRepo(),
      }).execute({ id: "analysis-1", userId: "user-1", rawResponse: bad }),
    ).rejects.toThrow("score must be a number from 0 to 100");
  });

  it("returns null for missing analysis", async () => {
    const result = await new PreviewJobMatchScoreCopyPasteUseCase({
      repo: jobMatchRepo(null),
    }).execute({
      id: "missing",
      userId: "user-1",
      rawResponse: validJobMatchEnvelope,
    });
    expect(result).toBeNull();
  });
});
