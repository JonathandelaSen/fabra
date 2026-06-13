import {
  AIAssistanceMode,
  AIEntityType,
  AIInteractionAppliedEvent,
  AIInteractionFailedEvent,
  AIInteractionFailureStage,
  AIInteractionPreparedEvent,
  AIInteractionRequestSentEvent,
  AIInteractionResponseReceivedEvent,
  AIInteractionResponseValidatedEvent,
  AIModule,
  AIOperation,
  UserId,
  type AIInteractionContext,
  type AIProvider,
  type EventBus,
} from "@/modules/shared";
import { CVAnalysis } from "../../domain/entities/cv-analysis.entity";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";
import type { CVScoringAIServiceFactory } from "../../domain/repositories/cv-scoring-ai.service";
import { CVAnalysisId } from "../../domain/value-objects/cv-analysis-id.value-object";
import { selectBestCVAnalysisText } from "../services/cv-analysis-text";

export interface ScoreCVAnalysisInput {
  id: string;
  userId: string;
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  additionalContext?: string | null;
  language?: string | null;
  requestId?: string;
}

export class ScoreCVAnalysisUseCase {
  constructor(
    private readonly deps: {
      repo: CVAnalysisRepository;
      aiServiceFactory: CVScoringAIServiceFactory;
      eventBus: EventBus;
      buildPrompt?: (additionalContext?: string | null, language?: string | null) => string;
    },
  ) {}

  async execute(input: ScoreCVAnalysisInput): Promise<CVAnalysis | null> {
    const id = CVAnalysisId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const current = await this.deps.repo.findById(id, userId);
    if (!current) return null;

    const primitives = current.toPrimitives();
    const text = selectBestCVAnalysisText(current);

    const context: AIInteractionContext = {
      interactionId: crypto.randomUUID(),
      attemptId: crypto.randomUUID(),
      requestId: input.requestId,
      userId: input.userId,
      module: AIModule.CVAnalysis,
      operation: AIOperation.ScoreCV,
      entityType: AIEntityType.CVAnalysis,
      entityId: input.id,
      assistanceMode: AIAssistanceMode.Integrated,
      provider: input.provider,
      model: input.model,
    };
    await this.deps.eventBus.publish([
      new AIInteractionPreparedEvent({
        context,
        prompt: `${this.deps.buildPrompt?.(input.additionalContext, input.language) ?? ""}\n\n${text}`,
        promptVersion: "1",
      }),
      new AIInteractionRequestSentEvent({ context }),
    ]);

    const aiService = this.deps.aiServiceFactory.create({
      provider: input.provider,
      apiKey: input.apiKey,
      baseUrl: input.baseUrl,
      model: input.model,
    });
    let result;
    const startedAt = Date.now();
    try {
      result = await aiService.score({
        text,
        additionalContext: input.additionalContext,
        language: input.language,
      });
      await this.deps.eventBus.publish([
        new AIInteractionResponseReceivedEvent({
          context,
          rawResponse: JSON.stringify(result),
          durationMs: Date.now() - startedAt,
        }),
        new AIInteractionResponseValidatedEvent({ context, parsedResult: result }),
      ]);
    } catch (error) {
      await this.deps.eventBus.publish([
        new AIInteractionFailedEvent({
          context,
          stage: AIInteractionFailureStage.Request,
          errorName: error instanceof Error ? error.name : "UnknownError",
          errorMessage: error instanceof Error ? error.message : String(error),
        }),
      ]);
      throw error;
    }

    const now = new Date().toISOString();
    current.applyAIResult({
      aiModel: input.model,
      score: result.score,
      feedback: result.feedback,
      keywords: result.keywords,
      improvements: result.improvements,
      aiContext: input.additionalContext
        ? { additionalContext: input.additionalContext }
        : primitives.aiContext,
      analyzedAt: now,
      updatedAt: now,
    });
    await this.deps.repo.save(current);

    const events = current.pullDomainEvents();
    await this.deps.eventBus.publish(events);
    await this.deps.eventBus.publish([new AIInteractionAppliedEvent({ context })]);

    return current;
  }
}
