import { Timestamp, UserId, type EventBus } from "@/modules/shared";
import { ProcessQuestion } from "../../domain/entities/process-question.entity";
import type {
  ProcessQuestionReadModel,
  ProcessQuestionRepository,
} from "../../domain/repositories/process-question.repository";
import { JobOpportunityId } from "../../domain/value-objects/job-opportunity-id.value-object";
import { ProcessQuestionId } from "../../domain/value-objects/process-question-id.value-object";
import { ProcessQuestionText } from "../../domain/value-objects/process-question-text.value-object";

export interface CreateProcessQuestionInput {
  userId: string;
  jobOpportunityId?: string | null;
  question: string;
  context?: string | null;
  answer?: string | null;
  aiModel?: string | null;
  aiGeneratedAt?: string | null;
  sourceJobMatchAnalysisId?: string | null;
  legacyCvId?: string | null;
}

export class CreateProcessQuestionUseCase {
  constructor(
    private readonly deps: {
      questionRepo: ProcessQuestionRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: CreateProcessQuestionInput): Promise<ProcessQuestionReadModel> {
    const now = new Date().toISOString();
    const question = ProcessQuestion.create({
      id: ProcessQuestionId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      jobOpportunityId: input.jobOpportunityId
        ? JobOpportunityId.fromPrimitives(input.jobOpportunityId)
        : null,
      question: ProcessQuestionText.fromPrimitives(input.question),
      context: input.context ?? null,
      answer: input.answer ?? null,
      aiModel: input.aiModel ?? null,
      aiGeneratedAt: input.aiGeneratedAt ?? null,
      sourceJobMatchAnalysisId: input.sourceJobMatchAnalysisId ?? null,
      legacyInterviewQuestionId: null,
      legacyCvId: input.legacyCvId ?? null,
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    const saved = await this.deps.questionRepo.save(question);

    const events = question.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
