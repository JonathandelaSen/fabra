import type { Query } from "@/backend/modules/shared";
import type { ReceivedFeedbackPrimitives } from "../../domain/entities/received-feedback.entity";

export interface ListReceivedFeedbackInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListReceivedFeedbackInRangeQuery
  implements Query<ListReceivedFeedbackInRangeInput, ReceivedFeedbackPrimitives[]>
{
  static readonly queryName = "received-feedback.list-received-feedback-in-range";

  readonly queryName = ListReceivedFeedbackInRangeQuery.queryName;

  constructor(public readonly payload: ListReceivedFeedbackInRangeInput) {}
}

