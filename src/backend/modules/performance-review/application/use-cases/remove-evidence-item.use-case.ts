import { ExecutionResult, UserId, type EventBus } from "@/backend/modules/shared";
import type { ReviewEvidenceItemRepository } from "../../domain/repositories/review-evidence-item.repository";
import { ReviewEvidenceItemId } from "../../domain/value-objects/review-evidence-item-id.value-object";

export interface RemoveEvidenceItemInput {
  id: string;
  userId: string;
}

export class RemoveEvidenceItemUseCase {
  constructor(
    private readonly deps: {
      itemRepo: ReviewEvidenceItemRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: RemoveEvidenceItemInput): Promise<ExecutionResult> {
    const itemId = ReviewEvidenceItemId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const existing = await this.deps.itemRepo.findById(itemId, userId);
    if (!existing) return ExecutionResult.fail();

    existing.delete();
    const deleted = (await this.deps.itemRepo.delete(itemId, userId)).toPrimitives();
    if (deleted) await this.deps.eventBus.publish(existing.pullDomainEvents());
    return ExecutionResult.fromPrimitives(deleted);
  }
}
