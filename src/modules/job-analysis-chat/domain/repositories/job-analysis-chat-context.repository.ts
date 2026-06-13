import type { JobAnalysisChatContext } from "../value-objects/job-analysis-chat-context.value-object";

export interface JobAnalysisChatContextReader {
  findByAnalysisId(input: {
    analysisId: string;
    userId: string;
  }): Promise<JobAnalysisChatContext | null>;
}
