import { Timestamp, UserId, type EventBus } from "@/modules/shared";
import type { ReviewEvidenceItem } from "../../domain/entities/review-evidence-item.entity";
import { ReviewEvidenceItemNotFoundError } from "../../domain/errors/review-evidence-item-not-found.error";
import type { ReviewEvidenceItemRepository } from "../../domain/repositories/review-evidence-item.repository";
import { EvidenceContent } from "../../domain/value-objects/evidence-content.value-object";
import { ReviewEvidenceItemId } from "../../domain/value-objects/review-evidence-item-id.value-object";

export interface UpdateEvidenceItemInput {
  id: string;
  userId: string;
  content?: string;
  highlighted?: boolean;
}

export class UpdateEvidenceItemUseCase {
  constructor(
    private readonly deps: {
      itemRepo: ReviewEvidenceItemRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: UpdateEvidenceItemInput): Promise<ReviewEvidenceItem> {
    const userId = UserId.fromPrimitives(input.userId);
    const item = await this.deps.itemRepo.findById(
      ReviewEvidenceItemId.fromPrimitives(input.id),
      userId,
    );
    if (!item) throw new ReviewEvidenceItemNotFoundError();

    const now = Timestamp.fromPrimitives(new Date().toISOString());
    if (input.content !== undefined) {
      item.updateContent(EvidenceContent.fromPrimitives(input.content), now);
    }
    if (input.highlighted !== undefined) {
      if (input.highlighted) item.highlight(now);
      else item.unhighlight(now);
    }

    const saved = await this.deps.itemRepo.save(item);
    await this.deps.eventBus.publish(item.pullDomainEvents());
    return saved;
  }
}
