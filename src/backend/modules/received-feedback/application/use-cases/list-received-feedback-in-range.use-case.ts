import { UserId } from "@/backend/modules/shared";
import type { ReceivedFeedbackRepository } from "../../domain/repositories/received-feedback.repository";
import { ReceivedFeedback } from "../../domain/entities/received-feedback.entity";

export interface ListReceivedFeedbackInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListReceivedFeedbackInRangeUseCase {
  constructor(
    private readonly deps: {
      receivedFeedbackRepo: ReceivedFeedbackRepository;
    },
  ) {}

  async execute(
    input: ListReceivedFeedbackInRangeInput,
  ): Promise<ReceivedFeedback[]> {
    const feedback = await this.deps.receivedFeedbackRepo.search({
      userId: UserId.fromPrimitives(input.userId),
      limit: 1000,
    });
    return feedback.filter((entry) => {
      const p = entry.toPrimitives();
      return (
        p.receivedDate >= input.dateFrom &&
        p.receivedDate <= input.dateTo &&
        (!input.contextId || p.activityContextId === input.contextId)
      );
    });
  }
}

