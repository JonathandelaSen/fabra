import { type EventBus } from "@/modules/shared";
import { FeedbackClosedError } from "../../domain/errors/feedback-closed.error";
import { FeedbackEntryNotFoundError } from "../../domain/errors/feedback-entry-not-found.error";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackEntryRepository } from "../../domain/repositories/feedback-entry.repository";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";

export class DeleteEntryUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      entryRepo: FeedbackEntryRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(userId: string, entryId: string): Promise<void> {
    const entry = await this.deps.entryRepo.findById(entryId, userId);
    if (!entry) throw new FeedbackEntryNotFoundError(entryId);
    const feedback = await this.deps.feedbackRepo.findById(entry.feedbackId, userId);
    if (!feedback) throw new FeedbackNotFoundError(entry.feedbackId);
    if (!feedback.isActive()) throw new FeedbackClosedError(entry.feedbackId);

    entry.delete();
    await this.deps.entryRepo.delete(entryId, userId);
    
    const events = entry.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
