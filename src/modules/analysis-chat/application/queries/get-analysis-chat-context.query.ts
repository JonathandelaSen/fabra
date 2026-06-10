import type { Query } from "@/modules/shared";
import type { AnalysisChatContext } from "../../domain/value-objects/analysis-chat-context.value-object";

export interface GetAnalysisChatContextInput {
  analysisId: string;
  userId: string;
}

export class GetAnalysisChatContextQuery implements Query<
  GetAnalysisChatContextInput,
  AnalysisChatContext | null
> {
  static readonly queryName = "analysis-chat.get-analysis-chat-context";

  readonly queryName = GetAnalysisChatContextQuery.queryName;

  constructor(public readonly payload: GetAnalysisChatContextInput) {}
}
