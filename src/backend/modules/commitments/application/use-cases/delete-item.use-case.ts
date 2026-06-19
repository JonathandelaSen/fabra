import { EntityId, UserId, type EventBus } from "@/backend/modules/shared";
import { CommitmentItemNotFoundError } from "../../domain/errors/commitment-item-not-found.error";
import type { CommitmentItemRepository } from "../../domain/repositories/commitment-item.repository";

export class DeleteCommitmentItemUseCase {
  constructor(private readonly deps: { itemRepo: CommitmentItemRepository; eventBus: EventBus }) {}

  async execute(input: { userId: string; id: string }): Promise<void> {
    const userId = UserId.fromPrimitives(input.userId);
    const id = EntityId.fromPrimitives(input.id);
    const item = await this.deps.itemRepo.findById(id, userId);
    if (!item) throw new CommitmentItemNotFoundError();
    item.delete();
    await this.deps.itemRepo.delete(id, userId);
    
    const events = item.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
