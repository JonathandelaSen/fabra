import { EntityId, UserId, type EventBus } from "@/backend/modules/shared";
import { CommitmentNotFoundError } from "../../domain/errors/commitment-not-found.error";
import type { CommitmentRepository } from "../../domain/repositories/commitment.repository";

export class DeleteCommitmentUseCase {
  constructor(private readonly deps: { commitmentRepo: CommitmentRepository; eventBus: EventBus }) {}

  async execute(input: { userId: string; id: string }): Promise<void> {
    const userId = UserId.fromPrimitives(input.userId);
    const id = EntityId.fromPrimitives(input.id);
    const commitment = await this.deps.commitmentRepo.findById(id, userId);
    if (!commitment) throw new CommitmentNotFoundError();
    commitment.delete();
    await this.deps.commitmentRepo.delete(id, userId);
    
    const events = commitment.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
