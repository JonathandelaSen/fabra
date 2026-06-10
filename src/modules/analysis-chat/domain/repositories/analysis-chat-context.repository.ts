import type { AnalysisChatContext } from "../value-objects/analysis-chat-context.value-object";

export interface AnalysisChatContextReader {
  findByAnalysisId(input: {
    analysisId: string;
    userId: string;
  }): Promise<AnalysisChatContext | null>;
}
