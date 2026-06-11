import type { QueryHandler } from "@/modules/shared";
import type { ListReceivedFeedbackInRangeUseCase } from "../use-cases/list-received-feedback-in-range.use-case";
import {
  ListReceivedFeedbackInRangeQuery,
  type EvidenceCandidateResult,
} from "./list-received-feedback-in-range.query";

export class ListReceivedFeedbackInRangeQueryHandler
  implements
    QueryHandler<ListReceivedFeedbackInRangeQuery, EvidenceCandidateResult[]>
{
  constructor(private readonly useCase: ListReceivedFeedbackInRangeUseCase) {}

  async handle(
    query: ListReceivedFeedbackInRangeQuery,
  ): Promise<EvidenceCandidateResult[]> {
    return this.useCase.execute(query.payload);
  }
}
