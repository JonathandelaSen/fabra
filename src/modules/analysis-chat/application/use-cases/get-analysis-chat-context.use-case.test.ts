import { describe, expect, it, vi } from "vitest";
import { GetAnalysisChatContextUseCase } from "./get-analysis-chat-context.use-case";
import { AnalysisChatContext } from "../../domain/value-objects/analysis-chat-context.value-object";

describe("GetAnalysisChatContextUseCase", () => {
  it("delegates to the legacy context reader", async () => {
    const context = AnalysisChatContext.fromPrimitives({
      analysisId: "analysis-1",
      cvId: "cv-1",
      analysisMode: "job_match",
      analysis: {},
      cv: {},
      cvText: "CV text",
    });
    const reader = { findByAnalysisId: vi.fn(async () => context) };

    await expect(
      new GetAnalysisChatContextUseCase({
        contextReader: reader,
      }).execute({
        analysisId: "analysis-1",
        userId: "user-1",
      }),
    ).resolves.toBe(context);
  });
});
