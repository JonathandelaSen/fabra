import { AIEntityType, AIModule, AIOperation, createIntegratedAIInteractionContext, publishAIInteractionApplied, runTrackedAIInteraction, serializeAIInteractionPrompt, type AIProvider, type EventBus } from "@/backend/modules/shared";
import type { StandardCVProfile } from "../../domain/cv-profile";
import type { CVTemplateId, CVTemplateLocale } from "../../domain/cv-templates";
import type { CVProfileEditingAIServiceFactory } from "../../domain/repositories/cv-profile-ai.service";

export interface EditCVProfileWithAIInput {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  profile: StandardCVProfile;
  instruction: string;
  templateId?: CVTemplateId;
  locale?: CVTemplateLocale;
  recommendations?: string[];
  userId: string;
  documentId: string;
}

export class EditCVProfileWithAIUseCase {
  constructor(
    private readonly deps: {
      aiFactory: CVProfileEditingAIServiceFactory;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: EditCVProfileWithAIInput): Promise<StandardCVProfile> {
    const service = this.deps.aiFactory.create({
      provider: input.provider,
      apiKey: input.apiKey,
      baseUrl: input.baseUrl,
      model: input.model,
    });

    const aiInput = {
      profile: input.profile,
      instruction: input.instruction,
      templateId: input.templateId,
      locale: input.locale,
      recommendations: input.recommendations,
    };
    const context = createIntegratedAIInteractionContext({
      userId: input.userId, module: AIModule.CVLibrary, operation: AIOperation.EditCV,
      entityType: AIEntityType.CVDocument, entityId: input.documentId,
      provider: input.provider, model: input.model,
    });
    const result = await runTrackedAIInteraction({
      eventBus: this.deps.eventBus, context,
      prompt: serializeAIInteractionPrompt(aiInput),
      execute: () => service.edit(aiInput),
    });
    await publishAIInteractionApplied(this.deps.eventBus, context);
    return result;
  }
}
