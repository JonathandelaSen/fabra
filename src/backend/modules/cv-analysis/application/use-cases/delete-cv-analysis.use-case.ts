import { ExecutionResult, UserId } from "@/backend/modules/shared";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";
import { CVAnalysisId } from "../../domain/value-objects/cv-analysis-id.value-object";

export class DeleteCVAnalysisUseCase {
  constructor(
    private readonly deps: {
      repo: CVAnalysisRepository;
    },
  ) {}

  async execute(input: { id: string; userId: string }): Promise<ExecutionResult> {
    const deleted = await this.deps.repo.delete(
      CVAnalysisId.fromPrimitives(input.id),
      UserId.fromPrimitives(input.userId),
    );
    return ExecutionResult.fromPrimitives(deleted);
  }
}
