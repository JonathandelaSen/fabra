import { UserId } from "@/modules/shared";
import type { ReceivedFeedbackRepository } from "../../domain/repositories/received-feedback.repository";
import type { EvidenceCandidateResult } from "../queries/list-received-feedback-in-range.query";

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
  ): Promise<EvidenceCandidateResult[]> {
    const feedback = await this.deps.receivedFeedbackRepo.search({
      userId: UserId.fromPrimitives(input.userId),
      limit: 1000,
    });
    return feedback
      .map((entry) => entry.toPrimitives())
      .filter(
        (p) =>
          p.receivedDate >= input.dateFrom &&
          p.receivedDate <= input.dateTo &&
          (!input.contextId || p.activityContextId === input.contextId),
      )
      .map((p) => ({
        sourceId: p.id,
        date: p.receivedDate,
        content: `${p.giverName}: ${p.feedbackText}`,
      }));
  }
}
