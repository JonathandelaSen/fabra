import { EntityId, UserId, type EventBus } from "@/modules/shared";
import { CommitmentOutcome, type CommitmentOutcomeStatus, type CommitmentOutcomeType } from "../../domain/entities/commitment-outcome.entity";
import type { CommitmentOutcomeRepository } from "../../domain/repositories/commitment-outcome.repository";

export interface CreateCommitmentOutcomeInput {
  userId: string;
  commitmentId: string;
  type: CommitmentOutcomeType;
  status?: CommitmentOutcomeStatus;
  title: string;
  description?: string | null;
  amount?: number | null;
  currency?: string | null;
  decidedAt?: string | null;
}

export class CreateCommitmentOutcomeUseCase {
  constructor(private readonly deps: { outcomeRepo: CommitmentOutcomeRepository; eventBus: EventBus }) {}

  async execute(input: CreateCommitmentOutcomeInput): Promise<CommitmentOutcome> {
    const now = new Date().toISOString();
    const outcome = CommitmentOutcome.create({
      id: EntityId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      commitmentId: EntityId.fromPrimitives(input.commitmentId),
      type: input.type,
      status: input.status,
      title: input.title,
      description: input.description,
      amount: input.amount,
      currency: input.currency,
      decidedAt: input.decidedAt,
      createdAt: now,
      updatedAt: now,
    });
    const saved = await this.deps.outcomeRepo.save(outcome);

    const events = outcome.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
