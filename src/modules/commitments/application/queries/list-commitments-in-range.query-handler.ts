import type { QueryHandler } from "@/modules/shared";
import type { ListCommitmentsInRangeUseCase } from "../use-cases/list-commitments-in-range.use-case";
import {
  ListCommitmentsInRangeQuery,
  type EvidenceCandidateResult,
} from "./list-commitments-in-range.query";

export class ListCommitmentsInRangeQueryHandler
  implements QueryHandler<ListCommitmentsInRangeQuery, EvidenceCandidateResult[]>
{
  constructor(private readonly useCase: ListCommitmentsInRangeUseCase) {}

  async handle(
    query: ListCommitmentsInRangeQuery,
  ): Promise<EvidenceCandidateResult[]> {
    return this.useCase.execute(query.payload);
  }
}
