import { describe, expect, it, vi } from "vitest";
import { GetJobAnalysisChatContextUseCase } from "../use-cases/get-job-analysis-chat-context.use-case";
import { GetJobAnalysisChatContextQuery } from "./get-job-analysis-chat-context.query";
import { GetJobAnalysisChatContextQueryHandler } from "./get-job-analysis-chat-context.query-handler";

describe("GetJobAnalysisChatContextQueryHandler", () => {
  it("delegates to the matching use case", async () => {
    const useCase = {
      execute: vi.fn(async () => null),
    } as unknown as GetJobAnalysisChatContextUseCase;
    const handler = new GetJobAnalysisChatContextQueryHandler(useCase);

    await handler.handle(
      new GetJobAnalysisChatContextQuery({
        analysisId: "analysis-1",
        userId: "user-1",
      }),
    );

    expect(useCase.execute).toHaveBeenCalledWith({
      analysisId: "analysis-1",
      userId: "user-1",
    });
  });
});
