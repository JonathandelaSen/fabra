import { AIEntityType, AIModule, AIOperation, createIntegratedAIInteractionContext, publishAIInteractionApplied, runTrackedAIInteraction, serializeAIInteractionPrompt, type AIProvider, type EventBus } from "@/backend/modules/shared";
import type {
  DraftEntryInput,
  JournalAIServiceFactory,
} from "../../domain/repositories/journal-ai-service.repository";
import { WorkJournalDraft } from "../../domain/value-objects/work-journal-draft.value-object";

export class DraftEntryUseCase {
  constructor(
    private readonly deps: {
      aiFactory: JournalAIServiceFactory;
      eventBus: EventBus;
    }
  ) {}

  async execute(
    userId: string,
    contextId: string,
    input: DraftEntryInput & {
      provider: AIProvider;
      apiKey?: string;
      baseUrl?: string;
      model: string;
    }
  ): Promise<WorkJournalDraft> {
    const { provider, apiKey, baseUrl, model, ...draftInput } = input;
    const aiService = this.deps.aiFactory.create({
      provider,
      apiKey,
      baseUrl,
      model,
    });
    const context = createIntegratedAIInteractionContext({
      userId, module: AIModule.WorkJournal, operation: AIOperation.DraftJournalEntry,
      entityType: AIEntityType.WorkJournalEntry, entityId: contextId, provider, model,
    });
    const finalText = await runTrackedAIInteraction({
      eventBus: this.deps.eventBus, context,
      prompt: serializeAIInteractionPrompt(draftInput),
      execute: () => aiService.draftEntry(draftInput),
    });
    await publishAIInteractionApplied(this.deps.eventBus, context);

    return WorkJournalDraft.fromPrimitives(finalText);
  }
}
