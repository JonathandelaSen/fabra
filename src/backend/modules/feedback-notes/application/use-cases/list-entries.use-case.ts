import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackEntryRepository } from "../../domain/repositories/feedback-entry.repository";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";
import { FeedbackEntry } from "../../domain/entities/feedback-entry.entity";

export class ListEntriesUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      entryRepo: FeedbackEntryRepository;
    }
  ) {}

  async execute(userId: string, feedbackId: string): Promise<FeedbackEntry[]> {
    const feedback = await this.deps.feedbackRepo.findById(feedbackId, userId);
    if (!feedback) throw new FeedbackNotFoundError(feedbackId);
    return this.deps.entryRepo.listByFeedback(feedbackId, userId);
  }
}
