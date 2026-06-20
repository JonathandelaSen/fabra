import { UserId, type EventBus } from "@/backend/modules/shared";
import { FeedbackEntry } from "../../domain/entities/feedback-entry.entity";
import { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";
import { FeedbackClosedError } from "../../domain/errors/feedback-closed.error";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackEntryRepository } from "../../domain/repositories/feedback-entry.repository";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";

export interface CreateEntryInput {
  user_id: string;
  feedback_id: string;
  content: string;
}

export class CreateEntryUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      entryRepo: FeedbackEntryRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: CreateEntryInput): Promise<FeedbackEntry> {
    const feedback = await this.deps.feedbackRepo.findById(
      FeedbackId.fromPrimitives(input.feedback_id),
      UserId.fromPrimitives(input.user_id)
    );
    if (!feedback) throw new FeedbackNotFoundError(input.feedback_id);
    if (!feedback.isActive()) throw new FeedbackClosedError(input.feedback_id);

    const now = new Date().toISOString();
    const entry = FeedbackEntry.create({
      id: crypto.randomUUID(),
      user_id: input.user_id,
      feedback_id: input.feedback_id,
      content: input.content,
      now,
    });
    const saved = await this.deps.entryRepo.save(entry);

    const events = entry.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
