import { EntityId, UserId, type EventBus } from "@/modules/shared";
import { CommitmentItemNotFoundError } from "../../domain/errors/commitment-item-not-found.error";
import { CommitmentItem, type CommitmentItemStatus } from "../../domain/entities/commitment-item.entity";
import type { CommitmentItemRepository } from "../../domain/repositories/commitment-item.repository";

export interface UpdateCommitmentItemInput {
  userId: string;
  id: string;
  title?: string;
  notes?: string | null;
  evidenceNotes?: string | null;
  status?: CommitmentItemStatus;
  dueDate?: string | null;
  completedAt?: string | null;
  orderIndex?: number;
}

export class UpdateCommitmentItemUseCase {
  constructor(private readonly deps: { itemRepo: CommitmentItemRepository; eventBus: EventBus }) {}

  async execute(input: UpdateCommitmentItemInput): Promise<CommitmentItem> {
    const userId = UserId.fromPrimitives(input.userId);
    const id = EntityId.fromPrimitives(input.id);
    const item = await this.deps.itemRepo.findById(id, userId);
    if (!item) throw new CommitmentItemNotFoundError();
    item.update({ ...input, updatedAt: new Date().toISOString() });
    const saved = await this.deps.itemRepo.save(item);
    
    const events = item.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
