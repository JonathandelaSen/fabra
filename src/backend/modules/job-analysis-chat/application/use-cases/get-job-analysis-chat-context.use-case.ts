import type { JobAnalysisChatContext } from "../../domain/value-objects/job-analysis-chat-context.value-object";
import type { JobAnalysisChatContextReader } from "../../domain/repositories/job-analysis-chat-context.repository";

export class GetJobAnalysisChatContextUseCase {
  constructor(
    private readonly deps: { contextReader: JobAnalysisChatContextReader },
  ) {}

  async execute(input: {
    analysisId: string;
    userId: string;
  }): Promise<JobAnalysisChatContext | null> {
    return this.deps.contextReader.findByAnalysisId(input);
  }
}
