import { UserId, type EventBus } from "@/backend/modules/shared";
import { FeedbackClosedError } from "../../domain/errors/feedback-closed.error";
import { FeedbackEntryNotFoundError } from "../../domain/errors/feedback-entry-not-found.error";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackEntryRepository } from "../../domain/repositories/feedback-entry.repository";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";
import { FeedbackEntry } from "../../domain/entities/feedback-entry.entity";
import { FeedbackEntryId } from "../../domain/value-objects/feedback-entry-id.value-object";
import { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";

export class UpdateEntryUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      entryRepo: FeedbackEntryRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(userId: string, entryId: string, content: string): Promise<FeedbackEntry> {
    const userIdVo = UserId.fromPrimitives(userId);
    const entry = await this.deps.entryRepo.findById(
      FeedbackEntryId.fromPrimitives(entryId),
      userIdVo,
    );
    if (!entry) throw new FeedbackEntryNotFoundError(entryId);
    const feedback = await this.deps.feedbackRepo.findById(
      FeedbackId.fromPrimitives(entry.feedbackId),
      userIdVo,
    );
    if (!feedback) throw new FeedbackNotFoundError(entry.feedbackId);
    if (!feedback.isActive()) throw new FeedbackClosedError(entry.feedbackId);

    entry.updateContent(content);
    const saved = await this.deps.entryRepo.save(entry);
    
    const events = entry.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
