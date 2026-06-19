import { EntityId, UserId, type EventBus } from "@/modules/shared";
import { CommitmentOutcomeNotFoundError } from "../../domain/errors/commitment-outcome-not-found.error";
import { CommitmentOutcome, type CommitmentOutcomeStatus, type CommitmentOutcomeType } from "../../domain/entities/commitment-outcome.entity";
import type { CommitmentOutcomeRepository } from "../../domain/repositories/commitment-outcome.repository";

export interface UpdateCommitmentOutcomeInput {
  userId: string;
  id: string;
  type?: CommitmentOutcomeType;
  status?: CommitmentOutcomeStatus;
  title?: string;
  description?: string | null;
  amount?: number | null;
  currency?: string | null;
  decidedAt?: string | null;
}

export class UpdateCommitmentOutcomeUseCase {
  constructor(private readonly deps: { outcomeRepo: CommitmentOutcomeRepository; eventBus: EventBus }) {}

  async execute(input: UpdateCommitmentOutcomeInput): Promise<CommitmentOutcome> {
    const userId = UserId.fromPrimitives(input.userId);
    const id = EntityId.fromPrimitives(input.id);
    const outcome = await this.deps.outcomeRepo.findById(id, userId);
    if (!outcome) throw new CommitmentOutcomeNotFoundError();
    outcome.update({ ...input, updatedAt: new Date().toISOString() });
    const saved = await this.deps.outcomeRepo.save(outcome);
    
    const events = outcome.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
