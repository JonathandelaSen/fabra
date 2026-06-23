import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { FilesystemEvalArtifactRepository } from "./filesystem-eval-artifact.repository";
import type { SaveEvalArtifactsInput } from "../../domain/repositories/eval-artifact.repository";

describe("FilesystemEvalArtifactRepository", () => {
  it("writes manifest, suite, case, run, and baseline result artifacts", async () => {
    const root = await mkdtemp(join(tmpdir(), "fabra-evals-"));
    const repo = new FilesystemEvalArtifactRepository(root);
    const input = createInput();

    try {
      const result = await repo.save(input);
      const saved = result.toPrimitives();

      expect(saved.casePath).toBe(
        join(root, "suites", "job_match_analysis.score_cv_against_offer", "cases", "senior-node.case.json"),
      );
      expect(saved.runPath).toBe(join(root, "runs", "2026-06-23T100000Z.fabra-baseline", "run.json"));
      expect(saved.resultPath).toBe(
        join(root, "runs", "2026-06-23T100000Z.fabra-baseline", "results", "senior-node.result.json"),
      );

      const manifest = JSON.parse(await readFile(join(root, "manifest.json"), "utf8"));
      expect(manifest).toMatchObject({
        schemaVersion: "1",
        workspaceName: "Fabra evals",
      });

      const suite = JSON.parse(
        await readFile(join(root, "suites", input.suite.suiteId, "suite.json"), "utf8"),
      );
      expect(suite.caseIds).toEqual([input.case.caseId]);

      const savedCase = JSON.parse(await readFile(saved.casePath, "utf8"));
      expect(savedCase).toMatchObject({
        caseId: input.case.caseId,
        actionId: input.case.actionId,
        name: input.case.name,
        renderedPrompt: input.case.renderedPrompt,
      });

      const run = JSON.parse(await readFile(saved.runPath!, "utf8"));
      expect(run.caseIds).toEqual([input.case.caseId]);

      const savedResult = JSON.parse(await readFile(saved.resultPath!, "utf8"));
      expect(savedResult).toMatchObject({
        resultId: input.result!.resultId,
        caseId: input.case.caseId,
        parsedOutput: { score: 72 },
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("updates an existing suite without duplicating case ids", async () => {
    const root = await mkdtemp(join(tmpdir(), "fabra-evals-"));
    const repo = new FilesystemEvalArtifactRepository(root);
    const input = createInput();

    try {
      await repo.save(input);
      await repo.save(input);

      const suite = JSON.parse(
        await readFile(join(root, "suites", input.suite.suiteId, "suite.json"), "utf8"),
      );
      expect(suite.caseIds).toEqual([input.case.caseId]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

function createInput(): SaveEvalArtifactsInput {
  const runtime = { provider: "gemini", model: "gemini-2.5-flash", temperature: null };
  const renderedPrompt = {
    format: "text" as const,
    text: "Score this CV against this offer.",
  };

  return {
    suite: {
      suiteId: "job_match_analysis.score_cv_against_offer",
      actionId: "job_match_analysis.score_cv_against_offer",
      name: "Job match scoring",
      description: "Captured job match scoring cases.",
    },
    case: {
      schemaVersion: "1",
      caseId: "senior-node",
      actionId: "job_match_analysis.score_cv_against_offer",
      name: "Senior Node case",
      note: "Useful baseline.",
      createdAt: "2026-06-23T10:00:00.000Z",
      createdBy: { source: "fabra", userRole: "admin" },
      input: { interactionId: "interaction-1" },
      promptTemplate: null,
      promptVariables: {},
      renderedPrompt,
      runtime,
      expectedOutput: { kind: "json", schemaRef: "fabra://job_match_analysis/score_response/v1" },
      source: {
        app: "fabra",
        route: "/admin/ai-interactions",
        entityRefs: { interactionId: "interaction-1" },
      },
    },
    run: {
      schemaVersion: "1",
      runId: "2026-06-23T100000Z.fabra-baseline",
      name: "Fabra baseline capture",
      actionId: "job_match_analysis.score_cv_against_offer",
      producer: "fabra",
      createdAt: "2026-06-23T10:00:00.000Z",
      caseIds: ["senior-node"],
      runtime,
      executionMode: "fabra_baseline_capture",
      notes: "Created while saving case from Fabra admin UI.",
    },
    result: {
      schemaVersion: "1",
      resultId: "2026-06-23T100000Z.fabra.senior-node",
      caseId: "senior-node",
      runId: "2026-06-23T100000Z.fabra-baseline",
      producer: "fabra",
      createdAt: "2026-06-23T10:00:00.000Z",
      runtime,
      promptVariables: {},
      renderedPrompt,
      rawOutput: "{\"score\":72}",
      parsedOutput: { score: 72 },
      status: "completed",
      error: null,
      usage: { inputTokens: null, outputTokens: null, costUsd: null },
      latencyMs: 1200,
    },
  };
}
