import type { QueryHandler } from "@/backend/modules/shared";
import type { ListCommitmentsInRangeUseCase } from "../use-cases/list-commitments-in-range.use-case";
import { ListCommitmentsInRangeQuery } from "./list-commitments-in-range.query";
import type { CommitmentPrimitives } from "../../domain/entities/commitment.entity";

export class ListCommitmentsInRangeQueryHandler
  implements QueryHandler<ListCommitmentsInRangeQuery, CommitmentPrimitives[]>
{
  constructor(private readonly useCase: ListCommitmentsInRangeUseCase) {}

  async handle(
    query: ListCommitmentsInRangeQuery,
  ): Promise<CommitmentPrimitives[]> {
    const commitments = await this.useCase.execute(query.payload);
    return commitments.map((c) => c.toPrimitives());
  }
}

