import type { Query } from "@/backend/modules/shared";
import type { CommitmentPrimitives } from "../../domain/entities/commitment.entity";

export interface ListCommitmentsInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListCommitmentsInRangeQuery
  implements Query<ListCommitmentsInRangeInput, CommitmentPrimitives[]>
{
  static readonly queryName = "commitments.list-commitments-in-range";

  readonly queryName = ListCommitmentsInRangeQuery.queryName;

  constructor(public readonly payload: ListCommitmentsInRangeInput) {}
}

