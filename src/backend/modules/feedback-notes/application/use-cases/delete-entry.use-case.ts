import { UserId, type EventBus } from "@/backend/modules/shared";
import { FeedbackClosedError } from "../../domain/errors/feedback-closed.error";
import { FeedbackEntryNotFoundError } from "../../domain/errors/feedback-entry-not-found.error";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackEntryRepository } from "../../domain/repositories/feedback-entry.repository";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";
import { FeedbackEntryId } from "../../domain/value-objects/feedback-entry-id.value-object";
import { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";

export class DeleteEntryUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      entryRepo: FeedbackEntryRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(userId: string, entryId: string): Promise<void> {
    const userIdVo = UserId.fromPrimitives(userId);
    const entryIdVo = FeedbackEntryId.fromPrimitives(entryId);
    const entry = await this.deps.entryRepo.findById(entryIdVo, userIdVo);
    if (!entry) throw new FeedbackEntryNotFoundError(entryId);
    const feedback = await this.deps.feedbackRepo.findById(
      FeedbackId.fromPrimitives(entry.feedbackId),
      userIdVo,
    );
    if (!feedback) throw new FeedbackNotFoundError(entry.feedbackId);
    if (!feedback.isActive()) throw new FeedbackClosedError(entry.feedbackId);

    entry.delete();
    await this.deps.entryRepo.delete(entryIdVo, userIdVo);
    
    const events = entry.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
