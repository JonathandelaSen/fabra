import { AIEntityType, AIModule, AIOperation, createIntegratedAIInteractionContext, publishAIInteractionApplied, runTrackedAIInteraction, serializeAIInteractionPrompt, type AIProvider, type EventBus } from "@/backend/modules/shared";
import type { StandardCVProfile } from "../../domain/cv-profile";
import type { CVProfileStructuringAIServiceFactory } from "../../domain/repositories/cv-profile-ai.service";

export interface StructureCVProfileWithAIInput {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  text: string;
  userId: string;
  documentId: string;
}

import { StructuredCVProfileData } from "../../domain/value-objects/structured-cv-profile-data.value-object";

export class StructureCVProfileWithAIUseCase {
  constructor(
    private readonly deps: {
      aiFactory: CVProfileStructuringAIServiceFactory;
      eventBus: EventBus;
    },
  ) {}

  async execute(
    input: StructureCVProfileWithAIInput,
  ): Promise<StructuredCVProfileData> {
    const service = this.deps.aiFactory.create({
      provider: input.provider,
      apiKey: input.apiKey,
      baseUrl: input.baseUrl,
      model: input.model,
    });

    const context = createIntegratedAIInteractionContext({
      userId: input.userId, module: AIModule.CVLibrary, operation: AIOperation.StructureCV,
      entityType: AIEntityType.CVDocument, entityId: input.documentId,
      provider: input.provider, model: input.model,
    });
    const result = await runTrackedAIInteraction({
      eventBus: this.deps.eventBus, context,
      prompt: serializeAIInteractionPrompt({ text: input.text }),
      execute: () => service.structure({ text: input.text }),
    });
    await publishAIInteractionApplied(this.deps.eventBus, context);
    return StructuredCVProfileData.fromPrimitives(result);
  }
}
