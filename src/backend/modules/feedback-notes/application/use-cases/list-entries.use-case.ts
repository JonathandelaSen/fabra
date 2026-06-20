import { UserId } from "@/backend/modules/shared";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackEntryRepository } from "../../domain/repositories/feedback-entry.repository";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";
import { FeedbackEntry } from "../../domain/entities/feedback-entry.entity";
import { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";

export class ListEntriesUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      entryRepo: FeedbackEntryRepository;
    }
  ) {}

  async execute(userId: string, feedbackId: string): Promise<FeedbackEntry[]> {
    const userIdVo = UserId.fromPrimitives(userId);
    const feedbackIdVo = FeedbackId.fromPrimitives(feedbackId);
    const feedback = await this.deps.feedbackRepo.findById(feedbackIdVo, userIdVo);
    if (!feedback) throw new FeedbackNotFoundError(feedbackId);
    return this.deps.entryRepo.listByFeedback(feedbackIdVo, userIdVo);
  }
}
