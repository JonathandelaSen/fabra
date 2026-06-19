import type { ProcessQuestionReadModel, ProcessQuestionRelatedCVPrimitives, ProcessQuestionRelatedAnalysisPrimitives } from "../../domain/value-objects/process-question-read-model.value-object";
import type { Analysis, CVRecord } from "@/lib/analysis-types";
import {
  AIEntityType, AIModule, AIOperation, createIntegratedAIInteractionContext,
  publishAIInteractionApplied, runTrackedAIInteraction, serializeAIInteractionPrompt,
  Timestamp,
  UserId,
  type AIProvider,
  type EventBus,
} from "@/backend/modules/shared";
import type {
  ProcessQuestionRepository,
} from "../../domain/repositories/process-question.repository";
import type { InterviewQuestionAIServiceFactory } from "../../domain/repositories/interview-question-ai.service";
import { ProcessQuestionId } from "../../domain/value-objects/process-question-id.value-object";

export interface GenerateQuestionAnswerInput {
  id: string;
  userId: string;
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  context: string;
  legacyCvId?: string | null;
  sourceJobMatchAnalysisId?: string | null;
  cv?: CVRecord | null;
  cvText?: string | null;
  analysis?: Analysis | null;
}

export class GenerateQuestionAnswerUseCase {
  constructor(
    private readonly deps: {
      questionRepo: ProcessQuestionRepository;
      aiFactory: InterviewQuestionAIServiceFactory;
      eventBus: EventBus;
    },
  ) {}

  async execute(
    input: GenerateQuestionAnswerInput,
  ): Promise<ProcessQuestionReadModel | null> {
    const id = ProcessQuestionId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const existing = await this.deps.questionRepo.findById(id, userId);
    if (!existing) return null;

    const question = existing.question.toPrimitives();

    const aiService = this.deps.aiFactory.create({
      provider: input.provider,
      apiKey: input.apiKey,
      baseUrl: input.baseUrl,
      model: input.model,
    });
    const aiInput = {
      question: question.question,
      context: input.context,
      cv: input.cv,
      cvText: input.cvText,
      analysis: input.analysis,
    };
    const interactionContext = createIntegratedAIInteractionContext({
      userId: input.userId, module: AIModule.SelectionProcess,
      operation: AIOperation.GenerateInterviewAnswer, entityType: AIEntityType.ProcessQuestion,
      entityId: input.id, provider: input.provider, model: input.model,
    });
    const answer = await runTrackedAIInteraction({
      eventBus: this.deps.eventBus, context: interactionContext,
      prompt: serializeAIInteractionPrompt(aiInput),
      execute: () => aiService.generateAnswer(aiInput),
    });

    existing.question.update({
      context: input.context,
      answer,
      legacyCvId: input.legacyCvId,
      sourceJobMatchAnalysisId: input.sourceJobMatchAnalysisId,
      aiModel: input.model,
      aiGeneratedAt: new Date().toISOString(),
      updatedAt: Timestamp.fromPrimitives(new Date().toISOString()),
    });

    const saved = await this.deps.questionRepo.save(existing.question);

    const events = existing.question.pullDomainEvents();
    await this.deps.eventBus.publish(events);
    await publishAIInteractionApplied(this.deps.eventBus, interactionContext);

    return saved;
  }
}
