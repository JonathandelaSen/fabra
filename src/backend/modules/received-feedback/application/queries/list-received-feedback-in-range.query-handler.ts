import type { QueryHandler } from "@/modules/shared";
import type { ListReceivedFeedbackInRangeUseCase } from "../use-cases/list-received-feedback-in-range.use-case";
import { ListReceivedFeedbackInRangeQuery } from "./list-received-feedback-in-range.query";
import type { ReceivedFeedbackPrimitives } from "../../domain/entities/received-feedback.entity";

export class ListReceivedFeedbackInRangeQueryHandler
  implements
    QueryHandler<ListReceivedFeedbackInRangeQuery, ReceivedFeedbackPrimitives[]>
{
  constructor(private readonly useCase: ListReceivedFeedbackInRangeUseCase) {}

  async handle(
    query: ListReceivedFeedbackInRangeQuery,
  ): Promise<ReceivedFeedbackPrimitives[]> {
    const feedback = await this.useCase.execute(query.payload);
    return feedback.map((entry) => entry.toPrimitives());
  }
}


