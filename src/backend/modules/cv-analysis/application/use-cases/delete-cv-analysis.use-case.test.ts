import { describe, expect, it, vi } from "vitest";
import { ExecutionResult } from "@/backend/modules/shared";
import { DeleteCVAnalysisUseCase } from "./delete-cv-analysis.use-case";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";

describe("DeleteCVAnalysisUseCase", () => {
  it("delegates deletion to the repository", async () => {
    const repo = {
      search: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(async () => true),
    } satisfies CVAnalysisRepository;

    const result = await new DeleteCVAnalysisUseCase({ repo }).execute({
      id: "analysis-1",
      userId: "user-1",
    });

    expect(result).toBeInstanceOf(ExecutionResult);
    expect(result.toPrimitives()).toBe(true);
    expect(repo.delete).toHaveBeenCalledOnce();
  });
});
