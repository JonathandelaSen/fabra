import { UserId } from "@/backend/modules/shared";
import { CommitmentPortfolio } from "../../domain/value-objects/commitment-portfolio.value-object";
import type { CommitmentItemRepository } from "../../domain/repositories/commitment-item.repository";
import type { CommitmentOutcomeRepository } from "../../domain/repositories/commitment-outcome.repository";
import type { CommitmentRepository } from "../../domain/repositories/commitment.repository";

export class ListCommitmentsWorkspaceUseCase {
  constructor(
    private readonly deps: {
      commitmentRepo: CommitmentRepository;
      itemRepo: CommitmentItemRepository;
      outcomeRepo: CommitmentOutcomeRepository;
    }
  ) {}

  async execute(userId: string): Promise<CommitmentPortfolio> {
    const userIdValue = UserId.fromPrimitives(userId);
    const [commitments, items, outcomes] = await Promise.all([
      this.deps.commitmentRepo.search(userIdValue),
      this.deps.itemRepo.searchByUser(userIdValue),
      this.deps.outcomeRepo.searchByUser(userIdValue),
    ]);
    return CommitmentPortfolio.fromCollections({ commitments, items, outcomes });
  }
}
