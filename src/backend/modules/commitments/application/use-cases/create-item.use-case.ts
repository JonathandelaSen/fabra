import { EntityId, UserId, type EventBus } from "@/modules/shared";
import { CommitmentItem, type CommitmentItemStatus } from "../../domain/entities/commitment-item.entity";
import type { CommitmentItemRepository } from "../../domain/repositories/commitment-item.repository";

export interface CreateCommitmentItemInput {
  userId: string;
  commitmentId: string;
  title: string;
  notes?: string | null;
  evidenceNotes?: string | null;
  status?: CommitmentItemStatus;
  dueDate?: string | null;
  orderIndex?: number;
}

export class CreateCommitmentItemUseCase {
  constructor(private readonly deps: { itemRepo: CommitmentItemRepository; eventBus: EventBus }) {}

  async execute(input: CreateCommitmentItemInput): Promise<CommitmentItem> {
    const now = new Date().toISOString();
    const item = CommitmentItem.create({
      id: EntityId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      commitmentId: EntityId.fromPrimitives(input.commitmentId),
      title: input.title,
      notes: input.notes,
      evidenceNotes: input.evidenceNotes,
      status: input.status,
      dueDate: input.dueDate,
      orderIndex: input.orderIndex ?? 0,
      createdAt: now,
      updatedAt: now,
    });
    const saved = await this.deps.itemRepo.save(item);

    const events = item.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
