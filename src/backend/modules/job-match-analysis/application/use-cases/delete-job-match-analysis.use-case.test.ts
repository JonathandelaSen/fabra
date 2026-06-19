import { describe, expect, it, vi } from "vitest";
import { ExecutionResult } from "@/backend/modules/shared";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import { DeleteJobMatchAnalysisUseCase } from "./delete-job-match-analysis.use-case";

describe("DeleteJobMatchAnalysisUseCase", () => {
  it("delegates deletion to the repository", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(async () => true),
    } satisfies JobMatchAnalysisRepository;

    const result = await new DeleteJobMatchAnalysisUseCase({ repo }).execute({
      id: "analysis-1",
      userId: "user-1",
    });

    expect(result).toBeInstanceOf(ExecutionResult);
    expect(result.toPrimitives()).toBe(true);
    expect(repo.delete).toHaveBeenCalledOnce();
  });
});
