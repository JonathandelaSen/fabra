import { EntityId, UserId, type EventBus } from "@/modules/shared";
import { Commitment, type CommitmentPriority, type CommitmentSource } from "../../domain/entities/commitment.entity";
import type { CommitmentRepository } from "../../domain/repositories/commitment.repository";

export interface CreateCommitmentInput {
  userId: string;
  contextId: string;
  title: string;
  description?: string | null;
  successCriteria?: string | null;
  resultNotes?: string | null;
  source: CommitmentSource;
  priority?: CommitmentPriority | null;
  startDate?: string;
  targetDate?: string | null;
}

export class CreateCommitmentUseCase {
  constructor(private readonly deps: { commitmentRepo: CommitmentRepository; eventBus: EventBus }) {}

  async execute(input: CreateCommitmentInput): Promise<Commitment> {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const commitment = Commitment.create({
      id: EntityId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      contextId: EntityId.fromPrimitives(input.contextId),
      title: input.title,
      description: input.description,
      successCriteria: input.successCriteria,
      resultNotes: input.resultNotes,
      source: input.source,
      priority: input.priority,
      startDate: input.startDate ?? today,
      targetDate: input.targetDate,
      createdAt: now,
      updatedAt: now,
    });
    const saved = await this.deps.commitmentRepo.save(commitment);

    const events = commitment.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
