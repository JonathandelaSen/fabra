import { AIEntityType, AIModule, AIOperation, createIntegratedAIInteractionContext, publishAIInteractionApplied, runTrackedAIInteraction, serializeAIInteractionPrompt, type EventBus } from "@/modules/shared";
import type { AIProvider } from "@/modules/shared";
import { FeedbackClosedError } from "../../domain/errors/feedback-closed.error";
import { FeedbackEntriesRequiredError } from "../../domain/errors/feedback-entries-required.error";
import { FeedbackNotFoundError } from "../../domain/errors/feedback-not-found.error";
import type { FeedbackAIServiceFactory } from "../../domain/repositories/feedback-ai-service.repository";
import type { FeedbackEntryRepository } from "../../domain/repositories/feedback-entry.repository";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";

export class GenerateFinalFeedbackUseCase {
  constructor(
    private readonly deps: {
      feedbackRepo: FeedbackRepository;
      entryRepo: FeedbackEntryRepository;
      aiFactory: FeedbackAIServiceFactory;
      eventBus: EventBus;
    }
  ) {}

  async execute(
    userId: string,
    feedbackId: string,
    aiConfig: { provider: AIProvider; apiKey?: string; baseUrl?: string; model: string },
  ) {
    const feedback = await this.deps.feedbackRepo.findById(feedbackId, userId);
    if (!feedback) throw new FeedbackNotFoundError(feedbackId);
    if (!feedback.isActive()) throw new FeedbackClosedError(feedbackId);
    const entries = await this.deps.entryRepo.listByFeedback(feedbackId, userId);
    if (entries.length === 0) throw new FeedbackEntriesRequiredError(feedbackId);

    const feedbackPrimitives = feedback.toPrimitives();
    const aiService = this.deps.aiFactory.create(aiConfig);
    const aiInput = {
      personName: feedbackPrimitives.person_name,
      entries: entries.map((entry) => {
        const primitives = entry.toPrimitives();
        return {
          content: primitives.content,
          created_at: primitives.created_at,
        };
      }),
    };
    const context = createIntegratedAIInteractionContext({
      userId, module: AIModule.FeedbackNotes, operation: AIOperation.GenerateFeedback,
      entityType: AIEntityType.Feedback, entityId: feedbackId,
      provider: aiConfig.provider, model: aiConfig.model,
    });
    const finalFeedback = await runTrackedAIInteraction({
      eventBus: this.deps.eventBus, context,
      prompt: serializeAIInteractionPrompt(aiInput),
      execute: () => aiService.generateFinalFeedback(aiInput),
    });
    feedback.updateFinalFeedback(finalFeedback);
    const saved = await this.deps.feedbackRepo.save(feedback);

    const events = feedback.pullDomainEvents();
    await this.deps.eventBus.publish(events);
    await publishAIInteractionApplied(this.deps.eventBus, context);

    return saved;
  }
}
