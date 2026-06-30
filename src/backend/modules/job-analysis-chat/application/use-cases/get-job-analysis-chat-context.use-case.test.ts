import { describe, expect, it, vi } from "vitest";
import { GetJobAnalysisChatContextUseCase } from "./get-job-analysis-chat-context.use-case";
import { JobAnalysisChatContext } from "../../domain/value-objects/job-analysis-chat-context.value-object";

describe("GetJobAnalysisChatContextUseCase", () => {
  it("delegates to the legacy context reader", async () => {
    const context = JobAnalysisChatContext.fromPrimitives({
      analysisId: "analysis-1",
      cvId: "cv-1",
      analysisMode: "job_match",
      analysis: {},
      cv: {},
      cvText: "CV text",
      people: [],
    });
    const reader = { findByAnalysisId: vi.fn(async () => context) };

    await expect(
      new GetJobAnalysisChatContextUseCase({
        contextReader: reader,
      }).execute({
        analysisId: "analysis-1",
        userId: "user-1",
      }),
    ).resolves.toBe(context);
  });
});
