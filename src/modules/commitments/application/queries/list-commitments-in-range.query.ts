import type { Query } from "@/modules/shared";

export interface EvidenceCandidateResult {
  sourceId: string;
  date: string | null;
  content: string;
}

export interface ListCommitmentsInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListCommitmentsInRangeQuery
  implements Query<ListCommitmentsInRangeInput, EvidenceCandidateResult[]>
{
  static readonly queryName = "commitments.list-commitments-in-range";

  readonly queryName = ListCommitmentsInRangeQuery.queryName;

  constructor(public readonly payload: ListCommitmentsInRangeInput) {}
}
