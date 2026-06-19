import type { Query } from "@/modules/shared";
import type { JobAnalysisChatContext } from "../../domain/value-objects/job-analysis-chat-context.value-object";

export interface GetJobAnalysisChatContextInput {
  analysisId: string;
  userId: string;
}

export class GetJobAnalysisChatContextQuery implements Query<
  GetJobAnalysisChatContextInput,
  JobAnalysisChatContext | null
> {
  static readonly queryName = "job-analysis-chat.get-job-analysis-chat-context";

  readonly queryName = GetJobAnalysisChatContextQuery.queryName;

  constructor(public readonly payload: GetJobAnalysisChatContextInput) {}
}
