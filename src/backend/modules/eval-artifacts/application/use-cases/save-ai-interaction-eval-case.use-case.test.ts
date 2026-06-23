import { describe, expect, it, vi } from "vitest";
import type { EvalArtifactRepository } from "../../domain/repositories/eval-artifact.repository";
import { EvalArtifactSaveResult } from "../../domain/value-objects/eval-artifact-save-result.value-object";
import { SaveAIInteractionEvalCaseUseCase } from "./save-ai-interaction-eval-case.use-case";

describe("SaveAIInteractionEvalCaseUseCase", () => {
  it("captures a completed interaction as an eval case with a baseline result", async () => {
    const repo: EvalArtifactRepository = {
      save: vi.fn(async () => EvalArtifactSaveResult.fromPrimitives({
        caseId: "id-123",
        casePath: "/evals/suites/job_match_analysis.score_cv_against_offer/cases/useful-case.case.json",
        runPath: "/evals/runs/2026-06-23T100000Z.fabra-baseline/run.json",
        resultPath: "/evals/runs/2026-06-23T100000Z.fabra-baseline/results/useful-case.result.json",
      })),
    };
    const useCase = new SaveAIInteractionEvalCaseUseCase({
      repo,
      now: () => new Date("2026-06-23T10:00:00.000Z"),
      randomId: () => "id-123",
    });

    const result = await useCase.execute({
      interaction: {
        interactionId: "interaction-1",
        module: "job-match-analysis",
        operation: "score_cv_against_offer",
        entityType: "job_match_analysis",
        entityId: "analysis-1",
        assistanceMode: "integrated",
        provider: "gemini",
        model: "gemini-2.5-flash",
        status: "validated",
        eventNames: [
          "ai_runtime.prompt_prepared",
          "ai_runtime.response_received",
          "ai_runtime.response_validated",
        ],
        occurredAt: "2026-06-23T09:59:50.000Z",
        prompt: "Score the CV.",
        promptHash: "hash",
        promptVersion: "job-match-v1",
        rawResponse: "{\"score\":72}",
        parsedResult: { score: 72 },
        error: null,
        durationMs: 1400,
        review: null,
      },
      name: "Useful case",
      note: "Good baseline",
    });

    expect(result.toPrimitives()).toEqual({
      caseId: "id-123",
      casePath: "/evals/suites/job_match_analysis.score_cv_against_offer/cases/useful-case.case.json",
      runPath: "/evals/runs/2026-06-23T100000Z.fabra-baseline/run.json",
      resultPath: "/evals/runs/2026-06-23T100000Z.fabra-baseline/results/useful-case.result.json",
    });
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({
      suite: expect.objectContaining({
        suiteId: "job_match_analysis.score_cv_against_offer",
        actionId: "job_match_analysis.score_cv_against_offer",
      }),
      case: expect.objectContaining({
        caseId: "id-123",
        actionId: "job_match_analysis.score_cv_against_offer",
        name: "Useful case",
        note: "Good baseline",
        renderedPrompt: { format: "text", text: "Score the CV." },
        runtime: { provider: "gemini", model: "gemini-2.5-flash", temperature: null },
        promptVariables: {},
        input: {
          interactionId: "interaction-1",
          module: "job-match-analysis",
          operation: "score_cv_against_offer",
          entityType: "job_match_analysis",
          entityId: "analysis-1",
        },
      }),
      run: expect.objectContaining({
        runId: "2026-06-23T100000Z.fabra-baseline",
        caseIds: ["id-123"],
      }),
      result: expect.objectContaining({
        caseId: "id-123",
        runId: "2026-06-23T100000Z.fabra-baseline",
        rawOutput: "{\"score\":72}",
        parsedOutput: { score: 72 },
        status: "completed",
        latencyMs: 1400,
      }),
    }));
  });

  it("rejects interactions without a captured prompt", async () => {
    const useCase = new SaveAIInteractionEvalCaseUseCase({
      repo: { save: vi.fn() },
      now: () => new Date("2026-06-23T10:00:00.000Z"),
      randomId: () => "id-123",
    });

    await expect(useCase.execute({
      interaction: {
        interactionId: "interaction-1",
        module: "job-match-analysis",
        operation: "score_cv_against_offer",
        entityType: "job_match_analysis",
        entityId: "analysis-1",
        assistanceMode: "integrated",
        provider: "gemini",
        model: "gemini-2.5-flash",
        status: "prepared",
        eventNames: ["ai_runtime.prompt_prepared"],
        occurredAt: "2026-06-23T09:59:50.000Z",
        prompt: null,
        promptHash: null,
        promptVersion: null,
        rawResponse: null,
        parsedResult: null,
        error: null,
        durationMs: null,
        review: null,
      },
      name: "Useful case",
      note: null,
    })).rejects.toThrow("Cannot save an eval case without a captured prompt");
  });
});
