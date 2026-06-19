import { EntityId, UserId, type EventBus } from "@/modules/shared";
import { ReceivedFeedback } from "../../domain/entities/received-feedback.entity";
import type { ReceivedFeedbackRepository } from "../../domain/repositories/received-feedback.repository";
import { ReceivedFeedbackDate } from "../../domain/value-objects/received-feedback-date.value-object";
import { ReceivedFeedbackGiverName } from "../../domain/value-objects/received-feedback-giver-name.value-object";
import { ReceivedFeedbackId } from "../../domain/value-objects/received-feedback-id.value-object";
import { ReceivedFeedbackNote } from "../../domain/value-objects/received-feedback-note.value-object";
import { ReceivedFeedbackText } from "../../domain/value-objects/received-feedback-text.value-object";

export interface CreateReceivedFeedbackInput {
  userId: string;
  receivedDate: string;
  giverName: string;
  feedbackText: string;
  userNote?: string | null;
  activityContextId: string;
  today?: string;
}

export class CreateReceivedFeedbackUseCase {
  constructor(
    private readonly deps: {
      receivedFeedbackRepo: ReceivedFeedbackRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: CreateReceivedFeedbackInput): Promise<ReceivedFeedback> {
    const now = new Date().toISOString();
    const feedback = ReceivedFeedback.create({
      id: ReceivedFeedbackId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      activityContextId: EntityId.fromPrimitives(input.activityContextId),
      receivedDate: ReceivedFeedbackDate.fromPrimitives(input.receivedDate, input.today),
      giverName: ReceivedFeedbackGiverName.fromPrimitives(input.giverName),
      feedbackText: ReceivedFeedbackText.fromPrimitives(input.feedbackText),
      userNote: ReceivedFeedbackNote.fromPrimitives(input.userNote),
      createdAt: now,
      updatedAt: now,
    });
    const saved = await this.deps.receivedFeedbackRepo.save(feedback);

    const events = feedback.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
