import type { Query } from "@/modules/shared";

export interface EvidenceCandidateResult {
  sourceId: string;
  date: string | null;
  content: string;
}

export interface ListReceivedFeedbackInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListReceivedFeedbackInRangeQuery
  implements Query<ListReceivedFeedbackInRangeInput, EvidenceCandidateResult[]>
{
  static readonly queryName = "received-feedback.list-received-feedback-in-range";

  readonly queryName = ListReceivedFeedbackInRangeQuery.queryName;

  constructor(public readonly payload: ListReceivedFeedbackInRangeInput) {}
}
