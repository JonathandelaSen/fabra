import type { ProcessQuestionReadModel, ProcessQuestionRelatedCVPrimitives, ProcessQuestionRelatedAnalysisPrimitives } from "../../domain/value-objects/process-question-read-model.value-object";
import { Timestamp, UserId, type EventBus } from "@/modules/shared";
import type {
  ProcessQuestionRepository,
} from "../../domain/repositories/process-question.repository";
import { JobOpportunityId } from "../../domain/value-objects/job-opportunity-id.value-object";
import { ProcessQuestionId } from "../../domain/value-objects/process-question-id.value-object";
import { ProcessQuestionText } from "../../domain/value-objects/process-question-text.value-object";

export interface UpdateProcessQuestionInput {
  id: string;
  userId: string;
  jobOpportunityId?: string | null;
  question?: string;
  context?: string | null;
  answer?: string | null;
  aiModel?: string | null;
  aiGeneratedAt?: string | null;
  sourceJobMatchAnalysisId?: string | null;
  legacyCvId?: string | null;
}

export class UpdateProcessQuestionUseCase {
  constructor(
    private readonly deps: {
      questionRepo: ProcessQuestionRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: UpdateProcessQuestionInput): Promise<ProcessQuestionReadModel | null> {
    const id = ProcessQuestionId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const existing = await this.deps.questionRepo.findById(id, userId);
    if (!existing) return null;

    existing.question.update({
      question: input.question
        ? ProcessQuestionText.fromPrimitives(input.question)
        : undefined,
      context: input.context,
      answer: input.answer,
      jobOpportunityId:
        input.jobOpportunityId === undefined
          ? undefined
          : input.jobOpportunityId
            ? JobOpportunityId.fromPrimitives(input.jobOpportunityId)
            : null,
      sourceJobMatchAnalysisId: input.sourceJobMatchAnalysisId,
      legacyCvId: input.legacyCvId,
      aiModel: input.aiModel,
      aiGeneratedAt: input.aiGeneratedAt,
      updatedAt: Timestamp.fromPrimitives(new Date().toISOString()),
    });

    const saved = await this.deps.questionRepo.save(existing.question);

    const events = existing.question.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
