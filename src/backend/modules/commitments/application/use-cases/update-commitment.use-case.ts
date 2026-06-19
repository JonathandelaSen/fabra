import { EntityId, UserId, type EventBus } from "@/modules/shared";
import { CommitmentNotFoundError } from "../../domain/errors/commitment-not-found.error";
import { Commitment, type CommitmentPriority, type CommitmentSource, type CommitmentStatus } from "../../domain/entities/commitment.entity";
import type { CommitmentRepository } from "../../domain/repositories/commitment.repository";

export interface UpdateCommitmentInput {
  userId: string;
  id: string;
  contextId?: string;
  title?: string;
  description?: string | null;
  successCriteria?: string | null;
  resultNotes?: string | null;
  source?: CommitmentSource;
  status?: CommitmentStatus;
  priority?: CommitmentPriority | null;
  startDate?: string;
  targetDate?: string | null;
}

export class UpdateCommitmentUseCase {
  constructor(private readonly deps: { commitmentRepo: CommitmentRepository; eventBus: EventBus }) {}

  async execute(input: UpdateCommitmentInput): Promise<Commitment> {
    const userId = UserId.fromPrimitives(input.userId);
    const id = EntityId.fromPrimitives(input.id);
    const commitment = await this.deps.commitmentRepo.findById(id, userId);
    if (!commitment) throw new CommitmentNotFoundError();
    commitment.update({ ...input, updatedAt: new Date().toISOString() });
    const saved = await this.deps.commitmentRepo.save(commitment);
    
    const events = commitment.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
