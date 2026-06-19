import { EntityId, UserId, type EventBus } from "@/backend/modules/shared";
import { CommitmentOutcomeNotFoundError } from "../../domain/errors/commitment-outcome-not-found.error";
import type { CommitmentOutcomeRepository } from "../../domain/repositories/commitment-outcome.repository";

export class DeleteCommitmentOutcomeUseCase {
  constructor(private readonly deps: { outcomeRepo: CommitmentOutcomeRepository; eventBus: EventBus }) {}

  async execute(input: { userId: string; id: string }): Promise<void> {
    const userId = UserId.fromPrimitives(input.userId);
    const id = EntityId.fromPrimitives(input.id);
    const outcome = await this.deps.outcomeRepo.findById(id, userId);
    if (!outcome) throw new CommitmentOutcomeNotFoundError();
    outcome.delete();
    await this.deps.outcomeRepo.delete(id, userId);
    
    const events = outcome.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
