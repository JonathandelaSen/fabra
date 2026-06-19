import { UserId } from "@/backend/modules/shared";
import type { CommitmentRepository } from "../../domain/repositories/commitment.repository";
import { Commitment } from "../../domain/entities/commitment.entity";

export interface ListCommitmentsInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListCommitmentsInRangeUseCase {
  constructor(
    private readonly deps: {
      commitmentRepo: CommitmentRepository;
    },
  ) {}

  async execute(
    input: ListCommitmentsInRangeInput,
  ): Promise<Commitment[]> {
    const userId = UserId.fromPrimitives(input.userId);
    const commitments = await this.deps.commitmentRepo.search(userId);

    return commitments.filter((c) => {
      const state = c.toPrimitives();
      const overlapsPeriod =
        state.startDate <= input.dateTo &&
        (state.targetDate === null || state.targetDate >= input.dateFrom);
      return (
        overlapsPeriod &&
        (!input.contextId || state.contextId === input.contextId)
      );
    });
  }
}

