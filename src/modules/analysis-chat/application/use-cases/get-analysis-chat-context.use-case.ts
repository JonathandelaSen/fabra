import type { AnalysisChatContext } from "../../domain/value-objects/analysis-chat-context.value-object";
import type { AnalysisChatContextReader } from "../../domain/repositories/analysis-chat-context.repository";

export class GetAnalysisChatContextUseCase {
  constructor(
    private readonly deps: { contextReader: AnalysisChatContextReader },
  ) {}

  async execute(input: {
    analysisId: string;
    userId: string;
  }): Promise<AnalysisChatContext | null> {
    return this.deps.contextReader.findByAnalysisId(input);
  }
}
